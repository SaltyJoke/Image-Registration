#include "image_utils.h"
#include "server.h"
#include <QTcpSocket>
#include <QDebug>

Server::Server(QObject *parent) : QTcpServer(parent)
{
    if (this->m_socket && this->m_socket->state() == QAbstractSocket::ConnectedState) {
        this->m_socket->readAll();
        this->m_socket->flush();
        this->m_socket->disconnectFromHost();
        this->m_socket->deleteLater();
    }
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

    // If there's an existing socket, delete it before processing a new connection
    if (this->m_socket && this->m_socket->state() == QAbstractSocket::ConnectedState) {
        this->m_socket->readAll();
        this->m_socket->flush();
        this->m_socket->disconnectFromHost();
        this->m_socket->deleteLater();
    }

    qDebug() << "****************** OPPENING CONNECTION ****************** ";

    this->m_socket = new QTcpSocket(this);
    this->m_socket->setSocketDescriptor(socketDescriptor);

    connect(this->m_socket, &QTcpSocket::readyRead, this, &Server::handleDataReceived);

    // Connect the socket's disconnected signal to handleCloseConnection slot
      connect(this->m_socket, &QTcpSocket::disconnected, this, &Server::handleCloseConnection);
//    this->m_socket->deleteLater();
}

void Server::handleDataReceived()
{

    qDebug() << 'HANDLE DATA RECEIVED CALLED';
    if (!this->m_socket) return;

    QJsonObject responseJson;
    try{
        QByteArray requestData = this->m_socket->readAll();

        emit newRequestReceived(requestData);

        // Check if it's an OPTIONS request for CORS preflight
        if (this->isPreflightRequest(requestData)) {
            this->handlePreflightRequest();

        } else {
            responseJson["data"] = processRequest(requestData);
            sendData(responseJson);
        }
    } catch (const std::exception &e) {
        responseJson["error"] = QString("something went wrong >> %1").arg(e.what());
        sendData(responseJson);
    }
}

void Server::handleCloseConnection()
{
    qDebug() << "---------------------------- CLOSING CONNECTION ----------------------------";
    QTcpSocket *socket = qobject_cast<QTcpSocket*>(sender());
      if (!socket)
          return;

      socket->deleteLater(); // Delete the socket object after it's closed
}

QJsonObject Server::processRequest(const QByteArray &request)
{

    // Process the received request and prepare the response here
    QJsonObject jsonResponse;


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
//    qDebug() << "Received JSON data:" << jsonData;


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
    qDebug() << "handle post request called "<< path;
    QJsonObject jsonResponse;

    // Handle GET request logic here
    if (path == "/align") {
        return handleAlignRequest(requestData);
    } else {
        // Unsupported path, return an error response
        jsonResponse["error"] = "Unsupported path";
    }

    return jsonResponse;
}

void Server::sendData(const QJsonObject &jsonObj)
{
    QJsonDocument responseDoc(jsonObj);
    QByteArray response;
    response.append("HTTP/1.1 200 OK\r\n");
    response.append("Content-Type: application/json\r\n");
    response.append("Access-Control-Allow-Origin: http://localhost:8080\r\n"); // Specify your web app's origin
    response.append("Access-Control-Allow-Methods: POST\r\n"); // Specify allowed methods
    response.append("Access-Control-Allow-Headers: Content-Type\r\n"); // Allow Content-Type header
    response.append("Content-Length: " + QByteArray::number(jsonObj.size()) + "\r\n");
    response.append("\r\n");
    response.append(responseDoc.toJson());

    this->m_socket->write(response);
    this->m_socket->flush();
    this->m_socket->waitForBytesWritten();
    this->m_socket->disconnectFromHost(); // Close the connection
    this->m_socket->close();
}

QJsonObject Server::handleAlignRequest(const QJsonObject &requestData)
{
    qDebug() << "handleAlignRequest called";
    QJsonObject jsonResponse;
    try {
        if (requestData.contains("image1") && requestData.contains("image2")) {
            qDebug() << "requestData has image1 and image2 data in it";
            // Extract image data from the JSON request

            QByteArray imageData1 = this->extractImageDataFromJsonValue(requestData["image1"]);
            //  QByteArray imageData1 = QByteArray::fromBase64(requestData["image1"].toString().toLatin1());
            if (imageData1.isEmpty()) {
                qDebug() << "Error: Failed to decode Base64-encoded image 1 data";
            } else {
                qDebug() << "converted image1 data to QBteArray";
                qDebug() << "Size of imageData1:" << imageData1.size() <<  "first 100: " << imageData1.left(100);

            }

            QByteArray imageData2 = this->extractImageDataFromJsonValue(requestData["image2"]);
            //            QByteArray imageData2 = QByteArray::fromBase64(requestData["image2"].toString().toLatin1());
            if (imageData2.isEmpty()) {
                qDebug() << "Error: Failed to decode Base64-encoded image 2 data";
            } else {
                qDebug() << "converted image2 data to QBteArray";
                qDebug() << "Size of imageData2:" << imageData2.size() <<  "first 100: " << imageData2.left(100);
            }


            Engine* registrationEngine = new Engine(this, imageData1, imageData2);
            qDebug() << "registrationEngine instance created";

            cv::Mat matrix = registrationEngine->align(Alignable::AlignmentAlgorithms::INTENSITY_BASED, true);

            // Convert cv::Mat matrix to a nested array structure
            QJsonArray matrixJson;
            for (int i = 0; i < matrix.rows; ++i) {
                QJsonArray rowJson;
                for (int j = 0; j < matrix.cols; ++j) {
                    rowJson.append(matrix.at<double>(i, j));
                }
                matrixJson.append(rowJson);
            }

            // Serialize matrixJson to a JSON string
            QJsonDocument doc(matrixJson);
            QString matrixString = doc.toJson();

            qDebug() << "matrix string" << matrixString;
            jsonResponse["successful"] = "sent image succesfully decoded in server";
            jsonResponse["transformation"] = matrixString;
        }
        return jsonResponse;
    } catch (const std::exception &e) {
        jsonResponse["error"] = "Request does not contain image blobs";
    }
}

bool Server::isPreflightRequest(const QByteArray &request)
{
    bool isOptions = false;
    bool hasAccessControlRequestMethod = false;

    QString requestString = QString::fromUtf8(request);
    QStringList lines = requestString.split("\r\n");
    qDebug() << lines[0];

    // Check if it's an OPTIONS request and includes the necessary CORS headers
    for (const QString &line : lines) {
        if (line.startsWith("OPTIONS")) {
            qDebug() << "OPTIONS; " << line;
            isOptions = true;
        } else if (line.contains("Access-Control-Request-Method")) {
            qDebug() << line;
            hasAccessControlRequestMethod = true;
        }
        if (isOptions && hasAccessControlRequestMethod) {
            qDebug() << "isPreflightRequest";
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

    this->m_socket->write(response);
}


QByteArray Server::extractImageDataFromJsonValue(QJsonValue value)
{
    QString base64Data = QString::fromUtf8(value.toString().toUtf8());
    QStringList parts = base64Data.split(",");

    if (parts.size() != 2) {
        return QByteArray();
        // Invalid data URI format, handle error
    } else {
        return QByteArray::fromBase64(parts[1].toUtf8());
    }
}
