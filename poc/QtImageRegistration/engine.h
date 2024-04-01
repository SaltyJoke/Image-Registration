#ifndef ENGINE_H
#define ENGINE_H

#include <QObject>
#include <QMap>
#include <QDebug>
#include <QFile>
#include "opencv2/opencv.hpp"
#include "alignable.h"
#include "image_utils.h"


using namespace cv;

class Engine : public QObject, public Alignable
{
    Q_OBJECT

    Mat m_referenceImage, m_targetImage;

public:
    explicit Engine(QObject *parent = nullptr, QByteArray imageData1 = QByteArray(), QByteArray  imageData2 = QByteArray());

    Mat referenceImage() const;
    Mat targetImage() const;

signals:

public slots:
    Mat align(AlignmentAlgorithms algorithm, bool previewResult = false) override;

private:
    Mat align_featureBased(bool previewResult = false);
    Mat align_intensityBased(bool previewResult = false);
};


#endif // ENGINE_H
