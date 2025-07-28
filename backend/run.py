import subprocess
import sys

def run(command):
    print(f"→ {command}")
    result = subprocess.run(command, shell=True)
    if result.returncode != 0:
        sys.exit(result.returncode)

def main():
    if not shutil.which("swag"):
        print("Installing swag (requires Go to be in PATH)...")
        run("go install github.com/swaggo/swag/cmd/swag@latest")

    run("swag init -g cmd/server/main.go")
    run("go run -tags=debug cmd/server/main.go")

if __name__ == "__main__":
    import shutil
    main()
