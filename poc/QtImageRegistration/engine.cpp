#include "engine.h"

#include <QMessageBox>


Mat Engine::referenceImage() const
{
    return m_referenceImage;
}

Mat Engine::targetImage() const
{
    return m_targetImage;
}


Engine::Engine(QObject *parent, QByteArray imageData1, QByteArray imageData2) : QObject(parent)
{

    qDebug() << "Size of imageData2:" << imageData2.size() <<  "first 100: " << imageData2.left(100);

    // Convert QByteArray to cv::Mat
    // Decode image data1
    std::vector<uchar> vecData1(imageData1.begin(), imageData1.end());
    this->m_referenceImage = cv::imdecode(cv::Mat(vecData1), cv::IMREAD_COLOR);
    if (this->m_referenceImage.empty()) {
        QMessageBox::warning(nullptr, "Error", "Error in reading image 1");
        return;
    }


    // Decode image data2
    std::vector<uchar> vecData2(imageData2.begin(), imageData2.end());
    this->m_targetImage = cv::imdecode(cv::Mat(vecData2), cv::IMREAD_COLOR);
    if (this->m_targetImage.empty()) {
        QMessageBox::warning(nullptr, "Error", "Error in reading image 2");
        return;
    }

    // Uncomment if you want to preview images
    //  ImageUtils::showImage(this->targetImage(), "Target Image");
    //  ImageUtils::showImage(this->targetImage(), "Target Image");
}

Mat Engine::align(AlignmentAlgorithms algorithm, bool previewResult)
{
    Mat matrix;
    switch (algorithm) {
    case AlignmentAlgorithms::FEATURE_BASED:
        matrix = align_featureBased(previewResult);
    case AlignmentAlgorithms::INTENSITY_BASED:
        matrix = align_intensityBased(previewResult);
    default:
        break;
    }
    return matrix;
}

Mat Engine::align_featureBased(bool previewResult)
{
    // Convert images to grayscale
    Mat grayReference, grayTarget;
    cvtColor(this->m_referenceImage, grayReference, COLOR_BGR2GRAY);
    cvtColor(this->m_targetImage, grayTarget, COLOR_BGR2GRAY);

    // Initialize SIFT detector and descriptor
    Ptr<SIFT> sift = SIFT::create();

    // Detect keypoints and compute descriptors
    vector<KeyPoint> keypointsReference, keypointsTarget;
    Mat descriptorsReference, descriptorsTarget;
    sift->detectAndCompute(grayReference, Mat(), keypointsReference, descriptorsReference);
    sift->detectAndCompute(grayTarget, Mat(), keypointsTarget, descriptorsTarget);

    // Match descriptors
    BFMatcher matcher(NORM_L2);
    vector<vector<DMatch>> knnMatches;
    matcher.knnMatch(descriptorsReference, descriptorsTarget, knnMatches, 2); // k=2 for 2-nearest neighbors

    // Apply ratio test to filter matches
    vector<DMatch> goodMatches;
    for (size_t i = 0; i < knnMatches.size(); i++) {
        if (knnMatches[i][0].distance < 0.75 * knnMatches[i][1].distance) {
            goodMatches.push_back(knnMatches[i][0]);
        }
    }

    // Extract matched keypoints
    vector<Point2f> matchedPointsReference, matchedPointsTarget;
    for (size_t i = 0; i < goodMatches.size(); i++) {
        matchedPointsReference.push_back(keypointsReference[goodMatches[i].queryIdx].pt);
        matchedPointsTarget.push_back(keypointsTarget[goodMatches[i].trainIdx].pt);
    }

    // Compute weights for each match (optional, based on distance)
    vector<float> weights;
    for (size_t i = 0; i < goodMatches.size(); i++) {
        float dist = goodMatches[i].distance;
        weights.push_back(1.0 / (1.0 + dist)); // Weight = 1 / (1 + distance)
    }

    // Find homography matrix with weighted points
    Mat homography = findHomography(matchedPointsTarget, matchedPointsReference, RANSAC, 3.0, weights);

    if(previewResult) {
        // Warp target image using homography // uncomment if you want to preview
        Mat alignedImage;
        warpPerspective(this->m_targetImage, alignedImage, homography, this->m_referenceImage.size());
        ImageUtils::previewResult(referenceImage(), alignedImage);
    }


    return homography;
}

Mat Engine::align_intensityBased(bool previewResult)
{
    // Convert input images to grayscale
    Mat sourceGray, targetGray;
    cvtColor(this->m_referenceImage, sourceGray, COLOR_BGR2GRAY);
    cvtColor(this->m_targetImage, targetGray, COLOR_BGR2GRAY);

    // Define motion model
    Mat warpMatrix = Mat::eye(2, 3, CV_32F);

    // Set termination criteria
    int maxIterations = 100;
    double epsilon = 1e-6;
    TermCriteria criteria(TermCriteria::COUNT + TermCriteria::EPS, maxIterations, epsilon);

    // Perform registration using OpenCV function
    findTransformECC(
                targetGray, sourceGray, warpMatrix,
                MOTION_EUCLIDEAN, criteria
                );

    if(previewResult) {
        // Apply the transformation matrix to the target image
        Mat alignedImage;
        warpAffine(this->m_targetImage, alignedImage, warpMatrix, this->m_referenceImage.size()); // Use sourceImage.size() as output size
        ImageUtils::previewResult(this->referenceImage(), alignedImage);
    }

    return warpMatrix;

    //////  To compare the output with these 2 approaches
    //////  Find ROIs for both reference and target images
    //////  Find the common ROI between reference and target images
    ////    Rect commonROI = calculateROIs(referenceImage, targetImage);
    ////    Mat alignedImage_WithROI = alignImages_IntensityBased_withROI(referenceImage, targetImage, MOTION_TRANSLATION, commonROI);
    ////    Mat resultWithROI = referenceImage.clone();
    ////    addWeighted(referenceImage, 0.5, alignedImage_WithROI, 0.5, 0, resultWithROI);
    ////    QString outFileName_roi = "/Users/mehrdadnekopour/Desktop/aligned-ib-roi.JPG";
    ////    imwrite(outFileName_roi.toStdString(), resultWithROI);
    ////    imshow(outFileName_roi.toStdString(), resultWithROI);
}
