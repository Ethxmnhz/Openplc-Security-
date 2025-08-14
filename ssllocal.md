1️⃣ Create the self-signed certificate

sudo mkdir -p /etc/ssl/private
sudo openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout /etc/ssl/private/openplc-selfsigned.key \
  -out /etc/ssl/certs/openplc-selfsigned.crt
When prompted, enter details (can leave most blank, but Common Name should be your server IP 10.254.46.241).

2️⃣ Create the Nginx config

sudo nano /etc/nginx/sites-available/openplc
Paste exactly what you provided:

server {
    listen 80;
    server_name 10.254.46.241;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name 10.254.46.241;

    ssl_certificate /etc/ssl/certs/openplc-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/openplc-selfsigned.key;

    location / {
        proxy_pass http://127.0.0.1:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

3️ Enable the site


sudo ln -s /etc/nginx/sites-available/openplc /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

4 Allow HTTPS through firewall (if using iptables)

sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
(Make permanent with iptables-persistent if needed)

5️ Access your OpenPLC web UI

Go to:

https://10.254.46.241
Ignore browser warning (self-signed cert) The password is encrypted.

6.Enable nginx service to start on boot
sudo systemctl enable nginx
sudo systemctl start nginx
sudo systemctl status nginx

7.Create and enable OpenPLC service
Create service file /etc/systemd/system/openplc.service with:

[Unit]
Description=OpenPLC Web Server
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/OpenPLC_v3/webserver
ExecStart=/usr/bin/python3 /home/pi/OpenPLC_v3/webserver/webserver.py
Restart=on-failure

[Install]
WantedBy=multi-user.target
Reload systemd and enable/start service:

7.Start Service
sudo systemctl daemon-reload
sudo systemctl enable openplc.service
sudo systemctl start openplc.service
sudo systemctl status openplc.service
Done! Both nginx and OpenPLC will auto start after reboot.
