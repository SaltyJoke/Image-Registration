#ifndef SERVER_H
#define SERVER_H

#include <QObject>
#include <QTcpServer>
#include <QJsonDocument>
#include <QJsonObject>
#include "engine.h"
#include "alignable.h"

class Server : public QTcpServer
{
    Q_OBJECT
public:
    explicit Server(QObject *parent = nullptr);
    ~Server();

    void startServer(int port);

    QJsonObject processRequest(const QByteArray &request);

protected:
    void incomingConnection(qintptr socketDescriptor) override;

private slots:

    bool isPreflightRequest(const QByteArray &request);
    void handlePreflightRequest();


    QJsonObject handleGetRequest(QString path, const QJsonObject &requestData);
    QJsonObject handleAlignRequest(const QJsonObject &requestData);
    QJsonObject handlePostRequest(QString path, const QJsonObject &requestData);

signals:
    void newRequestReceived(const QByteArray &request);

public slots:
    void sendData(const QByteArray &data);
};

#endif // SERVER_H
