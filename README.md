# AllSaveModBot Neon/Postgres

Постоянная версия: Render + Neon Postgres. Сообщения хранятся во внешней базе и не пропадают после перезапуска Render.

## Render variables
BOT_TOKEN=токен бота
OWNER_ID=5305261101
SECRET_TOKEN=my_secret_123
VIEWER_KEY=my_secret_123
DATABASE_URL=postgresql://...neon...
MAX_MESSAGES_PER_DIALOG=3000

Build Command: npm install
Start Command: npm start

Webhook:
$BOT_TOKEN="твой_токен"
$URL="https://ТВОЙ-СЕРВИС.onrender.com/webhook"
$SECRET="my_secret_123"
$ALLOWED='["message","edited_message","business_connection","business_message","edited_business_message","deleted_business_messages"]'
curl.exe -X POST "https://api.telegram.org/bot$BOT_TOKEN/setWebhook" --data-urlencode "url=$URL" --data-urlencode "secret_token=$SECRET" --data-urlencode "allowed_updates=$ALLOWED"
