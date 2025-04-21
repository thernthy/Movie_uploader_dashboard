import psutil
import json

def get_system_metrics():
    try:
        # Get CPU usage percentage
        cpu_usage = round(psutil.cpu_percent(interval=1), 2)

        # Get memory usage
        memory = psutil.virtual_memory()
        ram_used = round((memory.used / memory.total) * 100, 2)

        # Get disk usage
        disk = psutil.disk_usage('/')
        hdd_used = round((disk.used / disk.total) * 100, 2)
        hdd_capacity = round(disk.total / (1024**3), 2)  # Convert to GB and round to 2 decimals

        metrics = {
            "cpuUsed": cpu_usage,
            "ramUsed": ram_used,
            "hddUsed": hdd_used,
            "hddCapacity": hdd_capacity,
            "requests": 0  # Placeholder for actual request metric
        }
        return metrics
    except Exception as e:
        return {"error": "Failed to fetch system metrics"}

if __name__ == "__main__":
    metrics = get_system_metrics()
    print(json.dumps(metrics, indent=4))
