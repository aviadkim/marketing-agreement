FROM node:18-alpine

WORKDIR /app

# התקנת חבילות הנדרשות עבור pdfkit
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev

COPY package*.json ./

# התקנת כל החבילות כולל החדשות
RUN npm install
RUN npm install pdfkit nodemailer

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
