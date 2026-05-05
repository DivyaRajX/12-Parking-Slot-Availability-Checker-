Backend (Spring Boot)

Build and run with Maven. Configure PostgreSQL in `src/main/resources/application.properties`.

```bash
cd backend
mvn spring-boot:run
```

WebSocket endpoint: `ws://localhost:8080/ws/slots`
REST endpoints: `GET /parking`, `GET /parking/{id}/slots`, `PUT /slots/{id}/status`
