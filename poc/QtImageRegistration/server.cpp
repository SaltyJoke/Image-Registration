#include "image_utils.h"
#include "server.h"
#include <QTcpSocket>
#include <QDebug>

Server::Server(QObject *parent) : QTcpServer(parent)
{
}

Server::~Server()
{
}

void Server::incomingConnection(qintptr socketDescriptor)
{
    QTcpSocket *socket = new QTcpSocket(this);
    if (!socket->setSocketDescriptor(socketDescriptor)) {
        qDebug() << "Failed to set socket descriptor";
        delete socket;
        return;
    }

    connect(socket, &QTcpSocket::readyRead, this, &Server::readRequest);
}

void Server::readRequest()
{
    QTcpSocket *socket = qobject_cast<QTcpSocket*>(sender());
    if (!socket)
        return;

    QByteArray requestData = socket->readAll();
    qDebug() << "Received request:" << requestData;

    QJsonDocument requestJson = QJsonDocument::fromJson(requestData);
    QJsonObject jsonResponse = processRequest(requestJson);

    QJsonDocument responseJson(jsonResponse);
    QByteArray responseData = responseJson.toJson();

    socket->write(responseData);
    socket->flush();
    socket->waitForBytesWritten();
    socket->disconnectFromHost();
}

QJsonObject Server::processRequest(const QJsonDocument &requestData)
{
    QJsonObject jsonResponse;

    if (requestData.isNull() || requestData.isEmpty() || !requestData.isObject()) {
        // Invalid JSON request, return an error response
        jsonResponse["error"] = "Invalid JSON request";
        return jsonResponse;
    }

    // Check for request type (GET, POST, etc.) and handle accordingly
    if (requestData.object().contains("method")) {
        QString method = requestData.object()["method"].toString();
        if (method == "GET") {
            jsonResponse = handleGetRequest(requestData.object());
        } else if (method == "POST") {
            jsonResponse = handlePostRequest(requestData.object());
        } else {
            // Unsupported method, return an error response
            jsonResponse["error"] = "Unsupported method";
        }
    } else {
        // No method specified, return an error response
        jsonResponse["error"] = "Method not specified";
    }

    return jsonResponse;
}

QJsonObject Server::handleGetRequest(const QJsonObject &requestData)
{
    // Handle GET request logic here
    // For demonstration purposes, just echo back the received JSON data
    return requestData;
}

QJsonObject Server::handlePostRequest(const QJsonObject &requestData)
{
    QJsonObject jsonResponse;

    // Handle GET request logic here
    QString path = requestData["path"].toString();
    if (path == "/align") {
        return handleAlignRequest(requestData);
    } else {
        // Unsupported path, return an error response
        jsonResponse["error"] = "Unsupported path";
    }

    return requestData;
}

QJsonObject Server::handleAlignRequest(const QJsonObject &requestData)
{
    QJsonObject jsonResponse;
    try {
        if (requestData.contains("image1") && requestData.contains("image2")) {
            // Extract image data from the JSON request
            QByteArray imageData1 = QByteArray::fromBase64(requestData["image1"].toString().toLatin1());
            QByteArray imageData2 = QByteArray::fromBase64(requestData["image2"].toString().toLatin1());

            Engine* registrationEngine = new Engine(this, imageData1, imageData2);

            cv::Mat alignedImage = registrationEngine->align(Alignable::AlignmentAlgorithms::INTENSITY_BASED);
//            ImageUtils::previewResult(referenceImage, alignedImage);
        }
        return jsonResponse;
    } catch (const std::exception &e) {
        jsonResponse["error"] = "Request does not contain image blobs";
    }
}
