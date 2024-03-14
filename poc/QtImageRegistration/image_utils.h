#ifndef IMAGEUTILS_H
#define IMAGEUTILS_H

#include <opencv2/opencv.hpp>
#include <QString>

using namespace cv;
using namespace std;

class ImageUtils {
public:
    static void showImage(QString imageAddress);
    static Mat readImage(QString filePath);
    static void previewResult(Mat &image, Mat &overlayImage, QString outputPath = QString());

private:
    static Mat readFromBinary(QString filePath);
    static Mat readFromFile(QString filePath);


};

#endif // IMAGEUTILS_H
