#!/bin/bash
echo "[*] Applying hardened firewall rules..."

#####################################
# 0. Flush old rules and tables
iptables -F
iptables -X
iptables -t nat -F
iptables -t mangle -F

#####################################
# 1. Default policies
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

#####################################
# 2. Allow loopback traffic
iptables -A INPUT -i lo -j ACCEPT

#####################################
# 3. Allow established & related connections
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

#####################################
# 4. SSH brute-force protection (Port 22)
iptables -A INPUT -p tcp --dport 22 -m connlimit --connlimit-above 3 -j DROP
iptables -A INPUT -p tcp --dport 22 -m state --state NEW -j ACCEPT

#####################################
# 5. HTTPS brute-force protection (Port 443)
# Create custom chain
iptables -N HTTPS_BRUTEFORCE

# Jump new HTTPS connections to HTTPS_BRUTEFORCE chain
iptables -A INPUT -p tcp --dport 443 --syn -m conntrack --ctstate NEW -j HTTPS_BRUTEFORCE

# Add IP to recent list on every new connection
iptables -A HTTPS_BRUTEFORCE -m recent --name https_bruteforce --set

# Drop if IP is blocked (in blocked list) within last 180 seconds (3 minutes)
iptables -A HTTPS_BRUTEFORCE -m recent --name https_bruteforce_blocked --rcheck --seconds 180 -j DROP

# If more than 20 new connections in last 30 seconds, log, block for 180 seconds and drop
iptables -A HTTPS_BRUTEFORCE -m recent --name https_bruteforce --update --seconds 30 --hitcount 20 \
    -j LOG --log-prefix "HTTPS brute force detected: "
iptables -A HTTPS_BRUTEFORCE -m recent --name https_bruteforce --update --seconds 30 --hitcount 20 \
    -j SET --name https_bruteforce_blocked --seconds 180
iptables -A HTTPS_BRUTEFORCE -m recent --name https_bruteforce --update --seconds 30 --hitcount 20 -j DROP

# Accept normal connections
iptables -A HTTPS_BRUTEFORCE -j ACCEPT

#####################################
# 6. Block unencrypted OpenPLC Web (Port 8080)
iptables -A INPUT -p tcp --dport 8080 -j DROP
#####################################
# 7. Modbus TCP (Port 502) connection limits
iptables -A INPUT -p tcp --dport 502 -m connlimit --connlimit-above 10 -j DROP
iptables -A INPUT -p tcp --dport 502 -m state --state NEW -j ACCEPT

#####################################
# 8. VNC (Port 5900) connection limits
iptables -A INPUT -p tcp --dport 5900 -m connlimit --connlimit-above 5 -j DROP
iptables -A INPUT -p tcp --dport 5900 -m state --state NEW -j ACCEPT

#####################################
# 9. SYN Flood Protection
iptables -N SYN_PROTECT
iptables -A SYN_PROTECT -m limit --limit 10/s --limit-burst 20 -j RETURN
iptables -A SYN_PROTECT -j DROP
iptables -A INPUT -p tcp --syn -j SYN_PROTECT

#####################################
# 10. Drop invalid and fragmented packets
iptables -A INPUT -m conntrack --ctstate INVALID -j DROP
iptables -A INPUT -f -j DROP

#####################################
# 11. Drop suspicious TCP packets
iptables -A INPUT -p tcp --tcp-flags ALL NONE -j DROP
iptables -A INPUT -p tcp --tcp-flags ALL ALL -j DROP
iptables -A INPUT -p tcp --tcp-flags SYN,FIN SYN,FIN -j DROP
iptables -A INPUT -p tcp --tcp-flags SYN,RST SYN,RST -j DROP
iptables -A INPUT -p tcp --tcp-flags FIN,PSH,URG FIN,PSH,URG -j DROP
iptables -A INPUT -p tcp --tcp-flags ALL FIN,URG,PSH -j DROP
iptables -A INPUT -p tcp --tcp-flags ACK,ACK -j DROP

#####################################
# 12. Drop TCP SYN packets on non-allowed ports
iptables -A INPUT -p tcp --syn ! --dport 22 -j DROP
iptables -A INPUT -p tcp --syn ! --dport 443 -j DROP
iptables -A INPUT -p tcp --syn ! --dport 502 -j DROP
iptables -A INPUT -p tcp --syn ! --dport 8080 -j DROP
iptables -A INPUT -p tcp --syn ! --dport 5900 -j DROP

# Drop new connections not matched above
iptables -A INPUT -m conntrack --ctstate NEW -j DROP

#####################################
# 13. Save the rules so they persist after reboot
if command -v netfilter-persistent &>/dev/null; then
    netfilter-persistent save
    echo "[+] Saved rules with netfilter-persistent."
elif command -v service &>/dev/null && service iptables save 2>/dev/null; then
    service iptables save
    echo "[+] Saved rules with iptables service."
else
    echo "[!] Rules active but not saved permanently!"
fi

echo "[✓] Firewall rules applied successfully."
########
# Accept local subnet traffic immediately in HTTPS_BRUTEFORCE chain (adjust subnet as needed)
#iptables -I HTTPS_BRUTEFORCE -s 10.254.46.0/24 -j ACCEPT
#####################################
# 1. Create custom chain for HTTP SYN flood
iptables -N SYN_FLOOD_HTTP 2>/dev/null

# Allow limited new connections per second, drop excess
iptables -A SYN_FLOOD_HTTP -m limit --limit 10/s --limit-burst 20 -j RETURN
iptables -A SYN_FLOOD_HTTP -j DROP

# Apply to port 80
iptables -A INPUT -p tcp --dport 80 --syn -j SYN_FLOOD_HTTP

#####################################
# 2. Create custom chain for HTTPS SYN flood
iptables -N SYN_FLOOD_HTTPS 2>/dev/null
iptables -A SYN_FLOOD_HTTPS -m limit --limit 10/s --limit-burst 20 -j RETURN
iptables -A SYN_FLOOD_HTTPS -j DROP
iptables -A INPUT -p tcp --dport 443 --syn -j SYN_FLOOD_HTTPS

#####################################
# 3. Create custom chain for other critical ports (502 Modbus, 8080 OpenPLC, 5900 VNC)
for PORT in 502 8080 5900; do
    CHAIN="SYN_FLOOD_$PORT"
    iptables -N $CHAIN 2>/dev/null
    iptables -A $CHAIN -m limit --limit 10/s --limit-burst 20 -j RETURN
    iptables -A $CHAIN -j DROP
    iptables -A INPUT -p tcp --dport $PORT --syn -j $CHAIN
done

#####################################
echo "[✓] DoS/SYN flood protection applied successfully."
