#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <QDebug>
#include "opencv2/opencv.hpp"
#include "engine.h"
#include "alignable.h"
#include "image_utils.h"
#include "server.h"

using namespace std;
using namespace cv;


const int MAX_FEATURES = 500;
const float GOOD_MATCH_PERCENT = 0.45f;

namespace Ui {
class MainWindow;
}

class MainWindow : public QMainWindow
{
    Q_OBJECT

    Server *m_server;

public:
    explicit MainWindow(QWidget *parent = 0);
    ~MainWindow();


private slots:
    void handleRequestReceived(const QByteArray &request);

    void on_txtImg1_returnPressed();
    void on_txtImg2_returnPressed();

    void on_btnPreviewImg1_pressed();
    void on_btnPreviewImg2_pressed();

    void on_btnIntensityBased_pressed();
    void on_btnFeatureBased_pressed();

private:

    Mat alignImages_FeatureBased(Mat &referenceImage, Mat &targetImage);
    Mat alignImages_IntensityBased_withROI(Mat &sourceImage, Mat &targetImage, int motionModel, Rect roi);


    Rect calculateROIs(const Mat &referenceImage, const Mat &targetImage);



private:
    Ui::MainWindow *ui;
};

#endif // MAINWINDOW_H
