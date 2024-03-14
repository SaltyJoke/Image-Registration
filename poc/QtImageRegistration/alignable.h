#ifndef ALIGNABLE_H
#define ALIGNABLE_H

#include <opencv2/opencv.hpp>

using namespace cv;

class Alignable {
public:
    virtual ~Alignable() {} // Virtual destructor for proper cleanup

    enum class AlignmentAlgorithms{
           FEATURE_BASED,
           INTENSITY_BASED,
       };
private:
    virtual Mat align(AlignmentAlgorithms algorithm) = 0; // Pure virtual function for alignment
};

#endif // ALIGNABLE_H
