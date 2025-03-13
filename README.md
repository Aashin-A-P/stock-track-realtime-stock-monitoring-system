# stock-track-realtime-stock-monitoring-system
StockTrack is a real-time departmental stock monitoring system that ensures optimal inventory levels through automated alerts and detailed analytics. It streamlines stock management, reducing manual errors and enhancing operational efficiency.

## Prerequisites
- Ensure you have [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed.

## Installation
1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/stock-track-realtime-stock-monitoring-system.git
    cd stock-track-realtime-stock-monitoring-system
    ```

2. Create a `.env` file in the root directory and add the following environment variables:
    ```
    POSTGRES_USER=postgres
    POSTGRES_PASSWORD=admin
    POSTGRES_DB=stock_db
    SERVER_URL=http://localhost
    PORT=3000
    SECRET_KEY=mit-it-2024-stock-monitoring-system
    DATABASE_URL=postgresql://postgres:admin@postgres:5432/stock_db
    ```

## Usage
1. Start the Docker containers:
    ```bash
    docker-compose up --build
    ```

2. Open your browser and navigate to `http://<frontend_server_ip>:5173` to access the frontend application.

## Features
- Real-time stock monitoring
- Automated alerts for low stock levels
- Detailed analytics and reporting
- User-friendly interface

## Contributing
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a pull request.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
