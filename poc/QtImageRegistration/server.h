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

protected:
    void incomingConnection(qintptr socketDescriptor) override;

private slots:
    void readRequest();
    QJsonObject processRequest(const QJsonDocument &requestData);
    QJsonObject handleGetRequest(const QJsonObject &requestData);
    QJsonObject handleAlignRequest(const QJsonObject &requestData);
    QJsonObject handlePostRequest(const QJsonObject &requestData);

signals:
    void requestReceived(const QByteArray &request);
};

#endif // SERVER_H
