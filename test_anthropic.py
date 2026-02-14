"""
Anthropic API Key Validator
Tests your API key and lists available models.
Usage: python test_anthropic.py YOUR_API_KEY
"""

import sys
import json
import urllib.request
import urllib.error

def test_api_key(api_key):
    print("=" * 50)
    print("  Anthropic API Key Validator")
    print("=" * 50)
    print()

    # Test with a simple message on each model
    models = [
        "claude-opus-4-5-20251101",
        "claude-sonnet-4-5-20250514",
        "claude-3-5-sonnet-20241022",
        "claude-3-5-sonnet-20240620",
        "claude-3-5-haiku-20241022",
        "claude-3-opus-20240229",
        "claude-3-sonnet-20240229",
        "claude-3-haiku-20240307",
    ]

    available = []
    unavailable = []

    for model in models:
        try:
            data = json.dumps({
                "model": model,
                "max_tokens": 10,
                "messages": [{"role": "user", "content": "Hi"}]
            }).encode("utf-8")

            req = urllib.request.Request(
                "https://api.anthropic.com/v1/messages",
                data=data,
                headers={
                    "Content-Type": "application/json",
                    "x-api-key": api_key,
                    "anthropic-version": "2023-06-01"
                },
                method="POST"
            )

            with urllib.request.urlopen(req) as resp:
                result = json.loads(resp.read().decode())
                available.append(model)
                print(f"  ✅  {model}")

        except urllib.error.HTTPError as e:
            body = e.read().decode()
            try:
                err = json.loads(body)
                err_type = err.get("error", {}).get("type", "")
                err_msg = err.get("error", {}).get("message", "")
            except:
                err_type = "unknown"
                err_msg = body[:100]

            if e.code == 401:
                print(f"\n  ❌  INVALID API KEY — authentication failed.")
                print(f"      Error: {err_msg}")
                return
            elif e.code == 404 or "not_found" in err_type:
                unavailable.append(model)
                print(f"  ❌  {model}  (not available)")
            elif e.code == 403 or "permission" in err_type:
                unavailable.append(model)
                print(f"  🔒  {model}  (no permission)")
            else:
                unavailable.append(model)
                print(f"  ⚠️  {model}  ({e.code}: {err_msg[:60]})")

        except Exception as e:
            unavailable.append(model)
            print(f"  ⚠️  {model}  (error: {str(e)[:60]})")

    print()
    print("-" * 50)
    print(f"  ✅ Available: {len(available)}")
    print(f"  ❌ Unavailable: {len(unavailable)}")
    print("-" * 50)

    if available:
        print()
        print("  Models you can use:")
        for m in available:
            print(f"    • {m}")
    else:
        print()
        print("  ⚠️  No models available. Check your API key and billing.")

    print()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_anthropic.py YOUR_ANTHROPIC_API_KEY")
        sys.exit(1)

    test_api_key(sys.argv[1])
