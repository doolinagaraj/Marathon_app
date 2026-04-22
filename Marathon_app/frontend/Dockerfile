FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
# If a lockfile exists, prefer `npm ci` for reproducible installs; otherwise fall back to `npm install`.
RUN if [ -f package-lock.json ]; then \
			npm ci --prefer-offline --no-audit --progress=false; \
		else \
			npm install --no-audit --prefer-offline --no-progress; \
		fi

COPY index.html vite.config.js ./
COPY src ./src

EXPOSE 5173
CMD ["npm", "run", "dev"]

