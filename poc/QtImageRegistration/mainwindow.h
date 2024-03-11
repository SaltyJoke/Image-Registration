#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <QDebug>
#include "opencv2/opencv.hpp"

using namespace std;
using namespace cv;
//using namespace cv::xfeatures2d;

const int MAX_FEATURES = 500;
const float GOOD_MATCH_PERCENT = 0.45f;

namespace Ui {
class MainWindow;
}

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    explicit MainWindow(QWidget *parent = 0);
    ~MainWindow();


private slots:
    void on_txtImg1_returnPressed();
    void on_txtImg2_returnPressed();

    void on_btnPreviewImg1_pressed();
    void on_btnPreviewImg2_pressed();

    void on_btnIntensityBased_pressed();
    void on_btnFeatureBased_pressed();


    void on_btnRegister_pressed();

private:

    Mat alignImages_FeatureBased(Mat &referenceImage, Mat &targetImage);
    Mat alignImages_IntensityBased(Mat &image1, Mat &targetImage, int motionModel);
    Mat alignImages_IntensityBased_withROI(Mat &sourceImage, Mat &targetImage, int motionModel, Rect roi);


    Rect calculateROIs(const Mat &referenceImage, const Mat &targetImage);
    void previewImage(QString imageAddress);



private:
    Ui::MainWindow *ui;
};

#endif // MAINWINDOW_H
