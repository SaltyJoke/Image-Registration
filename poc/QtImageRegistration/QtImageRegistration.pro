#-------------------------------------------------
#
# Project created by QtCreator 2024-02-29T13:12:27
#
#-------------------------------------------------

QT       += core gui network

greaterThan(QT_MAJOR_VERSION, 4): QT += widgets




TARGET = QtImageRegistration
TEMPLATE = app

# The following define makes your compiler emit warnings if you use
# any feature of Qt which has been marked as deprecated (the exact warnings
# depend on your compiler). Please consult the documentation of the
# deprecated API in order to know how to port your code away from it.
DEFINES += QT_DEPRECATED_WARNINGS

# You can also make your code fail to compile if you use deprecated APIs.
# In order to do so, uncomment the following line.
# You can also select to disable deprecated APIs only up to a certain version of Qt.
#DEFINES += QT_DISABLE_DEPRECATED_BEFORE=0x060000    # disables all the APIs deprecated before Qt 6.0.0


SOURCES += \
        main.cpp \
        mainwindow.cpp \
        image_utils.cpp \
        engine.cpp \
        server.cpp

HEADERS += \
        mainwindow.h \
        alignable.h \
        image_utils.h \
        engine.h \
        server.h

FORMS += \
        mainwindow.ui

win32:CONFIG(release, debug|release): LIBS += -L/Users/mehrdadnekopour/OpenCV/build/install/lib/release/ -lopencv_world.4.9.0
else:win32:CONFIG(debug, debug|release): LIBS += -L/Users/mehrdadnekopour/OpenCV/build/install/lib/debug/ -lopencv_world.4.9.0
else:unix: LIBS += -L/Users/mehrdadnekopour/OpenCV/build/install/lib/ -lopencv_world.4.9.0

INCLUDEPATH += /Users/mehrdadnekopour/OpenCV/build/install/include/opencv4
DEPENDPATH += /Users/mehrdadnekopour/OpenCV/build/install/include/opencv4


