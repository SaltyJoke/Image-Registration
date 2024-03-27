#include "mainwindow.h"
#include "ui_mainwindow.h"

#include <qmessagebox.h>



MainWindow::MainWindow(QWidget *parent) :
    QMainWindow(parent),
    ui(new Ui::MainWindow)
{
    ui->setupUi(this);

    this->m_server = new Server(this);

    connect(this->m_server, &Server::newRequestReceived, this, &MainWindow::handleRequestReceived);

    int port = 8989;
    this->m_server->startServer(port);
}

MainWindow::~MainWindow()
{
    delete ui;
}

void MainWindow::handleRequestReceived(const QByteArray &request)
{
    // Process the received request here
//    qDebug() << "Received request:" << request;
    this->ui->txtLogs->appendPlainText(request);
    this->ui->txtLogs->appendPlainText("-----");

//    QJsonObject responseObject = this->m_server->processRequest(request);

}

void MainWindow::on_txtImg1_returnPressed()
{
    if(this->ui->txtImg1->text().length() > 0) {
        this->ui->btnPreviewImg1->setEnabled(true);
    }
}

void MainWindow::on_txtImg2_returnPressed()
{
    if(this->ui->txtImg2->text().length() > 0) {
        this->ui->btnPreviewImg2->setEnabled(true);
    }
}

void MainWindow::on_btnPreviewImg1_pressed()
{
    ImageUtils::showImage(this->ui->txtImg1->text());
}

void MainWindow::on_btnPreviewImg2_pressed()
{
    ImageUtils::showImage(this->ui->txtImg2->text());
}

void MainWindow::on_btnFeatureBased_pressed()
{
    try {
        Mat referenceImage = imread(this->ui->txtImg1->text().toStdString());
        Mat targetImage = imread(this->ui->txtImg2->text().toStdString());


        if (referenceImage.empty() || targetImage.empty()) {
            // Handle case when image loading fails
            return;
        }

        // Align images using feature-based registration
        Mat alignedImage = alignImages_FeatureBased(referenceImage, targetImage);

        // Overlay the aligned image on top of the reference image
        Mat resultImage = referenceImage.clone();
        addWeighted(referenceImage, 0.4, alignedImage, 0.8, 0, resultImage);

        QString outFileName = "/Users/mehrdadnekopour/Desktop/aligned-fb.JPG";
        imwrite(outFileName.toStdString(), resultImage);

        imshow(outFileName.toStdString(), resultImage);
    } catch (const std::exception &e) {
        qDebug() << "Exception occurred: " << e.what();
        QMessageBox::warning(nullptr, "Error", e.what());
    }
}

void MainWindow::on_btnIntensityBased_pressed()
{
//    try {
//        Mat referenceImage = ImageUtils::readImage(this->ui->txtImg1->text());
//        Mat targetImage = ImageUtils::readImage(this->ui->txtImg2->text());

//        if (referenceImage.empty() || targetImage.empty()) {
//            QMessageBox::warning(nullptr, "Error", "Error in readin images");
//            return;
//        }

//        Engine* registrationEngine = new Engine(this, referenceImage, targetImage);

//        Mat alignedImage = registrationEngine->align(Alignable::AlignmentAlgorithms::INTENSITY_BASED);
//        ImageUtils::previewResult(referenceImage, alignedImage);

//    } catch (const std::exception &e) {
//        qDebug() << "Exception occurred: " << e.what();
//        QMessageBox::warning(nullptr, "Error", e.what());
//    }

}

// utils -------
Mat MainWindow::alignImages_FeatureBased(Mat &referenceImage, Mat &targetImage)
{
    // Convert images to grayscale
    Mat grayReference, grayTarget;
    cvtColor(referenceImage, grayReference, COLOR_BGR2GRAY);
    cvtColor(targetImage, grayTarget, COLOR_BGR2GRAY);

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

    // Warp target image using homography
    Mat alignedImage;
    warpPerspective(targetImage, alignedImage, homography, referenceImage.size());

    return alignedImage;
}

Mat MainWindow::alignImages_IntensityBased_withROI(Mat &sourceImage, Mat &targetImage, int motionModel, Rect roi)
{
    // Convert input images to grayscale
    Mat sourceGray, targetGray;
    cvtColor(sourceImage, sourceGray, COLOR_BGR2GRAY);
    cvtColor(targetImage, targetGray, COLOR_BGR2GRAY);

    // Crop images based on ROI
    sourceGray = sourceGray(roi);
    targetGray = targetGray(roi);

    // Define motion model
    Mat warpMatrix = Mat::eye(2, 3, CV_32F);

    // Set termination criteria
    int maxIterations = 100;
    double epsilon = 1e-6;
    TermCriteria criteria(TermCriteria::COUNT + TermCriteria::EPS, maxIterations, epsilon);

    // Perform registration using OpenCV function
    findTransformECC(
                targetGray, sourceGray, warpMatrix,
                motionModel, criteria
                );

    // Apply the transformation matrix to the target image
    Mat registeredImage;
    warpAffine(targetImage, registeredImage, warpMatrix, sourceImage.size()); // Use sourceImage.size() as output size

    return registeredImage;
}

Rect MainWindow::calculateROIs(const Mat& referenceImage, const Mat& targetImage)
{
    // Convert images to grayscale
    Mat grayReference, grayTarget;
    cvtColor(referenceImage, grayReference, COLOR_BGR2GRAY);
    cvtColor(targetImage, grayTarget, COLOR_BGR2GRAY);

    // Initialize ORB detector and descriptor
    Ptr<ORB> orb = ORB::create();

    // Detect keypoints and compute descriptors
    vector<KeyPoint> keypointsReference, keypointsTarget;
    Mat descriptorsReference, descriptorsTarget;
    orb->detectAndCompute(grayReference, Mat(), keypointsReference, descriptorsReference);
    orb->detectAndCompute(grayTarget, Mat(), keypointsTarget, descriptorsTarget);

    // Match descriptors
    BFMatcher matcher(NORM_HAMMING);
    vector<DMatch> matches;
    matcher.match(descriptorsReference, descriptorsTarget, matches);

    // Filter matches based on distance
    double maxDist = 0.2 * sqrt(grayReference.rows * grayReference.rows + grayReference.cols * grayReference.cols);
    vector<DMatch> goodMatches;
    for (size_t i = 0; i < matches.size(); i++) {
        if (matches[i].distance < maxDist) {
            goodMatches.push_back(matches[i]);
        }
    }

    // Find common ROI based on keypoints of good matches
    vector<Point2f> pointsReference, pointsTarget;
    for (size_t i = 0; i < goodMatches.size(); i++) {
        pointsReference.push_back(keypointsReference[goodMatches[i].queryIdx].pt);
        pointsTarget.push_back(keypointsTarget[goodMatches[i].trainIdx].pt);
    }

    // Compute homography
    Mat homography = findHomography(pointsTarget, pointsReference, RANSAC);

    // Apply homography to the target image corners to find the transformed bounding box
    vector<Point2f> targetCorners(4);
    targetCorners[0] = Point2f(0, 0);
    targetCorners[1] = Point2f(0, grayTarget.rows);
    targetCorners[2] = Point2f(grayTarget.cols, grayTarget.rows);
    targetCorners[3] = Point2f(grayTarget.cols, 0);
    vector<Point2f> referenceCorners(4);
    perspectiveTransform(targetCorners, referenceCorners, homography);

    // Find the bounding rectangle of the transformed corners
    Rect commonROI = boundingRect(referenceCorners);

    // Adjust the rectangle to ensure it is within the dimensions of the reference image
    commonROI &= Rect(0, 0, grayReference.cols, grayReference.rows);

    return commonROI;
}


