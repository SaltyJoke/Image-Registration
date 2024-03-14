# Prerequisites

- Qt 5.10
- OpenCV - Compiled libraries to replace the library's path into the projects .pro file,

# Engine Class Documentation

## Overview

The `Engine` class is a core component of the image registration functionality in the Qt C++ application. It provides methods to align two images based on different algorithms: feature-based alignment and intensity-based alignment. This class inherits from both `QObject` and `Alignable`, allowing it to emit signals and implement alignment functionality, respectively.

## Header File: `engine.h`

### Public Members

- **Constructor:**
  - `Engine(QObject *parent = nullptr, QString referenceImageAddress = QString(), QString targetImageAddress = QString())`: Constructs an `Engine` object with optional parent and image file addresses for the reference and target images.
  - `Engine(QObject *parent = nullptr, const Mat& referenceImage = Mat(), const Mat& targetImage = Mat())`: Constructs an `Engine` object with optional parent and reference/target image matrices.

### Methods

- `Mat referenceImage() const`: Returns the reference image.
- `Mat targetImage() const`: Returns the target image.
- `Mat align(AlignmentAlgorithms algorithm) override`: Aligns the target image with the reference image using the specified alignment algorithm.

### Signals

- None

### Slots

- None

## Source File: `engine.cpp`

### Private Members

- `Mat m_referenceImage`: Stores the reference image.
- `Mat m_targetImage`: Stores the target image.

### Methods

- `Mat align_featureBased()`: Performs feature-based alignment of the target image with the reference image.
- `Mat align_intensityBased()`: Performs intensity-based alignment of the target image with the reference image.

### Constructor

- Initializes the `Engine` object with provided image addresses or matrices. If images fail to load, it shows a warning message.

### align() Method

- Aligns the target image with the reference image based on the specified algorithm. It returns the aligned image.

## Usage

To use the `Engine` class for image registration, create an instance of the class and call the `align()` method with the desired alignment algorithm.

```cpp
Engine engine(nullptr, referenceImagePath, targetImagePath);
Mat alignedImage = engine.align(AlignmentAlgorithms::FEATURE_BASED);
```
