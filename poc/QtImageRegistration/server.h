#ifndef SERVER_H
#define SERVER_H

#include <QObject>
#include <QTcpServer>
#include <QJsonDocument>
#include <QJsonObject>
#include <QJsonArray>
#include "engine.h"
#include "alignable.h"

class Server : public QTcpServer
{
    Q_OBJECT

    QTcpSocket *m_socket;
public:
    explicit Server(QObject *parent = nullptr);
    ~Server();

    void startServer(int port);

    QJsonObject processRequest(const QByteArray &request);

protected:
    void incomingConnection(qintptr socketDescriptor) override;

private slots:

    void handleDataReceived();
    void handleCloseConnection();

    bool isPreflightRequest(const QByteArray &request);
    void handlePreflightRequest();


    QJsonObject handleGetRequest(QString path, const QJsonObject &requestData);
    QJsonObject handleAlignRequest(const QJsonObject &requestData);
    QJsonObject handlePostRequest(QString path, const QJsonObject &requestData);

    QByteArray extractImageDataFromJsonValue(QJsonValue value);

signals:
    void newRequestReceived(const QByteArray &request);

public slots:
    void sendData(const QJsonObject &jsonObj);
};

#endif // SERVER_H
