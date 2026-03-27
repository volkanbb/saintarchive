import sys

def find_non_ascii(filepath):
    try:
        with open(filepath, 'rb') as f:
            content = f.read()
            for i, byte in enumerate(content):
                if byte > 127:
                    line = content[:i].count(b'\n') + 1
                    col = i - content.rfind(b'\n', 0, i)
                    print(f"Non-ASCII byte: {byte} (0x{byte:02x}) at line {line}, col {col}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        find_non_ascii(sys.argv[1])
    else:
        print("Usage: python check_ascii.py <filepath>")
