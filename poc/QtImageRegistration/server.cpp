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

void Server::startServer(int port)
{
    if (!this->listen(QHostAddress::Any, port)) {
        qDebug() << "Server could not start!";
    } else {
        qDebug() << "Server started successfully on port" << port;
    }
}

void Server::incomingConnection(qintptr socketDescriptor)
{
    QTcpSocket *socket = new QTcpSocket(this);
    socket->setSocketDescriptor(socketDescriptor);

    connect(socket, &QTcpSocket::readyRead, [=]() {
        QByteArray requestData = socket->readAll();
        emit newRequestReceived(requestData);

        // Check if it's an OPTIONS request for CORS preflight
        if (this->isPreflightRequest(requestData)) {
            this->handlePreflightRequest();
            return;
        }

        QJsonObject responseJson = processRequest(requestData);

        QJsonDocument responseDoc(responseJson);
        QByteArray response;
        response.append("HTTP/1.1 200 OK\r\n");
        response.append("Content-Type: application/json\r\n");
        response.append("Access-Control-Allow-Origin: http://localhost:8080\r\n"); // Specify your web app's origin
        response.append("Access-Control-Allow-Methods: POST\r\n"); // Specify allowed methods
        response.append("Access-Control-Allow-Headers: Content-Type\r\n"); // Allow Content-Type header
        response.append("Content-Length: " + QByteArray::number(responseJson.size()) + "\r\n");
        response.append("\r\n");
        response.append(responseDoc.toJson());

        socket->write(response);
        socket->flush();
        socket->waitForBytesWritten();
        socket->close();
    });
}

QJsonObject Server::processRequest(const QByteArray &request)
{
    QJsonObject jsonResponse;

    // Process the received request here
    qDebug() << "Received request:" << request;

    // Parse the HTTP request
    // Assuming the first line contains the HTTP method
    QString requestString = QString::fromUtf8(request);
    QStringList lines = requestString.split("\r\n");

    QString firstLine = lines.first();

    QStringList HttpRequestInfos = firstLine.split(" ");
    QString httpMethod = HttpRequestInfos[0];
    QString path = HttpRequestInfos[1];

    qDebug() << httpMethod << path;

    int separatorPosition = request.indexOf("\r\n\r\n");
    if (separatorPosition == -1) {
        qDebug() << "Invalid HTTP request: empty line not found";
        jsonResponse["error"] = "Invalid HTTP request: empty line not found";
        return jsonResponse;
    }

    // Extract JSON content from the request body
    QByteArray jsonData = request.mid(separatorPosition + 4);
    qDebug() << "Received JSON data:" << jsonData;


    // Parse the JSON request
    QJsonParseError jsonError;
    QJsonDocument jsonDoc = QJsonDocument::fromJson(jsonData, &jsonError);

    if (jsonError.error != QJsonParseError::NoError) {
        qDebug() << "Error parsing JSON:" << jsonError.errorString();
        qDebug() << "At offset:" << jsonError.offset;
        jsonResponse["error"] = jsonError.errorString() + jsonError.offset;
        return jsonResponse;
    }

    if (jsonDoc.isNull() || jsonDoc.isEmpty() || !jsonDoc.isObject()) {
        // Invalid JSON request, return an error response
        jsonResponse["error"] = "Invalid JSON request";
        return jsonResponse;
    }

    QJsonObject jsonObj = jsonDoc.object();

    if (httpMethod == "GET") {
        jsonResponse = this->handleGetRequest(path, jsonObj);
    } else if (httpMethod == "POST") {
        jsonResponse = this->handlePostRequest(path, jsonObj);
    } else {
        qDebug() << "Unsupported HTTP method:" << httpMethod;
        jsonResponse["error"] = "Unsupported method";
    }

    return jsonResponse;
}

QJsonObject Server::handleGetRequest(QString path, const QJsonObject &requestData)
{
    // Handle GET request logic here
    // For demonstration purposes, just echo back the received JSON data
    return requestData;
}

QJsonObject Server::handlePostRequest(QString path, const QJsonObject &requestData)
{
    qDebug() << "handle post request called "<< path << requestData;
    QJsonObject jsonResponse;

    // Handle GET request logic here
    if (path == "/align") {
        return handleAlignRequest(requestData);
    } else {
        // Unsupported path, return an error response
        jsonResponse["error"] = "Unsupported path";
    }

    return requestData;
}

void Server::sendData(const QByteArray &data)
{
    for (auto socket : this->findChildren<QTcpSocket *>()) {
        socket->write(data);
        socket->flush();
        socket->waitForBytesWritten();
    }
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

bool Server::isPreflightRequest(const QByteArray &request)
{
    QString requestString = QString::fromUtf8(request);
    QStringList lines = requestString.split("\r\n");
    // Check if it's an OPTIONS request and includes the necessary CORS headers
    for (const QString &line : lines) {
        if (line.startsWith("OPTIONS") && line.contains("Access-Control-Request-Method")) {
            return true;
        }
    }
    return false;
}

void Server::handlePreflightRequest()
{
    // Respond to the CORS preflight request with the necessary headers
    QByteArray response = "HTTP/1.1 200 OK\r\n"
                          "Access-Control-Allow-Origin: http://localhost:8080\r\n"
                          "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n"
                          "Access-Control-Allow-Headers: Content-Type\r\n"
                          "Access-Control-Max-Age: 86400\r\n"
                          "\r\n";


}
