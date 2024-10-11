const notificationChannel = PropertiesService.getScriptProperties().getProperty(
    'NOTIFICATION_CHANNEL'
)
const slackToken =
    PropertiesService.getScriptProperties().getProperty('SLACK_BOT_TOKEN')

function doPost(e: GoogleAppsScript.Events.DoPost) {
    const body = JSON.parse(e.postData.contents)
    // URL Verification
    if (body.type === 'url_verification') {
        return ContentService.createTextOutput(body.challenge)
    }

    // チャンネルIDを取得
    const channel = body.event.channel
    if (channel.id && channel.creator) {
        postMessage(channel)
        return ContentService.createTextOutput('Success')
    } else {
        return ContentService.createTextOutput('Error')
    }
}

function doGet(e: GoogleAppsScript.Events.DoGet) {
    return ContentService.createTextOutput('Hello World')
}

function postMessage(channelData: { id: string; creator: string }) {
    const creatorName = getUserInfo(channelData.creator)
    const message = creatorName
        ? `${creatorName}さんが新しいチャンネル「<#${channelData.id}>」を作成しました！ :tada:`
        : `新しいチャンネル「<#${channelData.id}>」が作成されました！ :tada:`
    UrlFetchApp.fetch('https://slack.com/api/chat.postMessage', {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({
            channel: notificationChannel,
            text: message,
        }),
        headers: {
            Authorization: `Bearer ${slackToken}`,
        },
    })
}

function getUserInfo(userId: string) {
    const userInfoApi = UrlFetchApp.fetch(
        `https://slack.com/api/users.info?user=${userId}`,
        {
            method: 'get',
            headers: {
                Authorization: `Bearer ${slackToken}`,
            },
        }
    )
    const userInfoResponse = JSON.parse(userInfoApi.getContentText())
    if (!userInfoResponse.ok) {
        return null
    }
    if (userInfoResponse.user.profile.display_name) {
        return userInfoResponse.user.profile.display_name_normalized
    } else {
        return userInfoResponse.user.profile.real_name_normalized
    }
}
