# Prerequisites

- [Qt 5.14.2](https://download.qt.io/new_archive/qt/5.14/5.14.2)
- [OpenCV](https://opencv.org) - Compiled libraries to replace the library's path into the projects .pro file,
- [CMake v3](https://cmake.org/download/) download for your os from latest versions section

# Setup and running:

## Setup OpenCV (MacOS)
- Create a new folder named opencv in the root of your C drive and Extract opencv zip file in there
- Inside C:/opencv folder create a new folder named _build_
- Open CMAke, Choose C:/opencv as the source path, and C:/opencv/build as the target folder to build the library
- Press the configure button, it will take a while to configure the build
- In the text field in the middle, find and checkmark BUILD_opencv_world.
- In the same place, find CMAKE_INSTALL_PREFIX and change its path to C:/opencv/build/install
- Press the configure button again
- Press on Generate button
- Close CMake, Navigate to C:/opencv/build folder in your terminal and run: _make_ command, it will take a while
- Then, run _make install_
- Continue to **Set path of OpenCV in Qt project**

## Setup OpenCV (Windows)
- Create a new folder named opencv in the root of your C drive and Extract opencv zip file in there
- The include file is installed under c:/opencv/build/include,
  the library files are installed under c:/opencv/build/x64/vc16/bin and lib
- Go to C:/opencv/build and run setup_vars_opencv4.cmd
- Continue to **Set path of OpenCV in Qt project**

## Set path of OpenCV in Qt project

- Open QT project using the .pro file in the root of project
- Comment out these lines

win32:CONFIG(release, debug|release): LIBS += -L/Users/mehrdadnekopour/OpenCV/build/install/lib/release/ -lopencv_world.4.9.0
else:win32:CONFIG(debug, debug|release): LIBS += -L/Users/mehrdadnekopour/OpenCV/build/install/lib/debug/ -lopencv_world.4.9.0
else:unix: LIBS += -L/Users/mehrdadnekopour/OpenCV/build/install/lib/ -lopencv_world.4.9.0

INCLUDEPATH += /Users/mehrdadnekopour/OpenCV/build/install/include/opencv4
DEPENDPATH += /Users/mehrdadnekopour/OpenCV/build/install/include/opencv4

- Then right click and press on _Add Library_ item
- Choose External Library
- Add the built library from this path in C:/opencv/build/install/include/opencv4

## Troubleshoot when build Qt project on Windows
If you get "NK1158: cannot run 'rc.exe'",

Open build env by pushing project setting

add C:\Program Files (x86)\Windows Kits\10\bin\10.0.18362.0\x64 to Path

# Design
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
