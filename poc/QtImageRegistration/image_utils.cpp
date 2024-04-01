#include "image_utils.h"
#include <QPixmap>
#include <QImage>
#include <QLabel>
#include <QMessageBox>
#include <QFile>
#include <QDebug>

void ImageUtils::showImage(QString imageAddress) {
    Mat image = readImage(imageAddress);

    if (!image.empty()) {
        ImageUtils::showImage(image, QString(imageAddress.split('/').last()));
    } else {
        QMessageBox::warning(nullptr, "Error", "Image is empty! showImage");
    }
}

void ImageUtils::showImage(const Mat &image, QString title)
{
    if (!image.empty()) {
        string windowName = title.toStdString();
        namedWindow(windowName, WINDOW_GUI_EXPANDED);
        imshow(windowName, image);
    } else {
        QMessageBox::warning(nullptr, "Error", "Image is empty! showImage");
    }
}

Mat ImageUtils::readImage(QString filePath)
{
    QString fileType = filePath.split(".").last();

    Mat image;
    if (fileType == "bin") {
        image = readFromBinary(filePath);

    } else {
        image = readFromFile(filePath);
    }

    if(image.empty()) {
        QMessageBox::warning(nullptr, "Error in readImage", "Image is empty! readImage");
    }

    return image;
}

void ImageUtils::previewResult(const Mat &image, const Mat &overlayImage, QString outputPath)
{
    // Overlay the aligned image on top of the reference image
    Mat resultImage = image.clone();
    addWeighted(image, 0.5, overlayImage, 0.5, 0, resultImage);

    imshow("Registered Image", resultImage);

    if(!outputPath.isNull()) {
        imwrite(outputPath.toStdString(), resultImage);
    }
}

Mat ImageUtils::readFromFile(QString filePath)
{
    return imread(filePath.toStdString(), IMREAD_COLOR);
}

Mat ImageUtils::readFromBinary(QString filePath)
{
    Mat image;

    // Open the .bin file for reading
    QFile file(filePath);
    if (!file.open(QIODevice::ReadOnly)) {
        qDebug() << "Failed to open file: " << filePath;
        return image; // Return empty Mat if failed to open file
    }

    // Read the width and height from the file
    int width, height;
    if (file.read(reinterpret_cast<char*>(&width), sizeof(int)) != sizeof(int)) {
        qDebug() << "Error reading width.";
        file.close();
    }
    if (file.read(reinterpret_cast<char*>(&height), sizeof(int)) != sizeof(int)) {
        qDebug() << "Error reading height.";
        file.close();
    }

    // Read the binary data from the file
    QByteArray imageData = file.readAll();
    file.close();

    // Convert QByteArray to vector<char>
    vector<char> buffer(imageData.begin(), imageData.end());

    // Convert the binary data to an image using OpenCV
    image = imdecode(Mat(buffer), IMREAD_UNCHANGED);

    if (image.empty()) {
        qDebug() << "Failed to decode the image from file: " << filePath;
    }

    // Ensure that the size matches the provided width and height
    if (image.cols != width || image.rows != height) {
        qDebug() << "Error: Image dimensions do not match the provided width and height.";
    }

    return image;
}
