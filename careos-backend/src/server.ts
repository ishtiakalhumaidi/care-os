import { createServer } from "http";
import app from "./app.ts";
import { envVars } from "./app/config/env.ts";
import { initSocket } from "./app/lib/socket.ts";

const bootstrap = async () => {
  try {
 
    const server = createServer(app);

    initSocket(server, envVars.FRONTEND_URL as string);

  
    server.listen(envVars.PORT, () => {
      console.log(
        `[CareOS] Core System running on http://localhost:${envVars.PORT} with WebSockets enabled`,
      );
    });
  } catch (error) {
    console.error("[CareOS] System Failure:", error);
    process.exit(1);
  }
};

bootstrap();