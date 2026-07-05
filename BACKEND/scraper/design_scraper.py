import os
import json
import time
from playwright.sync_api import sync_playwright

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "design-inspiration")
CATEGORIES = ["cards", "dashboards", "forms", "navigation", "colors", "institutional"]

SOURCES = [
    {
        "name": "dribbble-government-dashboard",
        "url": "https://dribbble.com/search/government-dashboard",
        "category": "dashboards",
        "selectors": [".shot-thumbnail-container img", "picture img"],
    },
    {
        "name": "dribbble-admin-panel",
        "url": "https://dribbble.com/search/admin-panel-ui",
        "category": "dashboards",
        "selectors": [".shot-thumbnail-container img", "picture img"],
    },
    {
        "name": "dribbble-glassmorphism",
        "url": "https://dribbble.com/search/glassmorphism-ui",
        "category": "cards",
        "selectors": [".shot-thumbnail-container img", "picture img"],
    },
    {
        "name": "dribbble-dark-dashboard",
        "url": "https://dribbble.com/search/dark-dashboard-ui",
        "category": "dashboards",
        "selectors": [".shot-thumbnail-container img", "picture img"],
    },
    {
        "name": "dribbble-card-design",
        "url": "https://dribbble.com/search/card-design-ui",
        "category": "cards",
        "selectors": [".shot-thumbnail-container img", "picture img"],
    },
    {
        "name": "dribbble-professional-dashboard",
        "url": "https://dribbble.com/search/professional-dashboard",
        "category": "dashboards",
        "selectors": [".shot-thumbnail-container img", "picture img"],
    },
]

def setup_output_dirs():
    for category in CATEGORIES:
        os.makedirs(os.path.join(OUTPUT_DIR, category), exist_ok=True)

def scrape_source(page, source):
    print(f"\nScraping: {source['name']}")
    page.goto(source["url"], wait_until="networkidle", timeout=30000)
    time.sleep(3)

    # Scroll to load lazy images
    for _ in range(4):
        page.evaluate("window.scrollBy(0, 800)")
        time.sleep(1)

    screenshots_dir = os.path.join(OUTPUT_DIR, source["category"])
    metadata = []

    for selector in source["selectors"]:
        images = page.query_selector_all(selector)
        print(f"  Found {len(images)} images with selector: {selector}")
        for i, img in enumerate(images[:8]):
            src = img.get_attribute("src") or img.get_attribute("data-src")
            if not src:
                continue
            try:
                img.screenshot(
                    path=os.path.join(
                        screenshots_dir,
                        f"{source['name']}_{i+1:02d}.png",
                    )
                )
                metadata.append({
                    "source": source["name"],
                    "category": source["category"],
                    "index": i + 1,
                    "image_src": src,
                })
                print(f"    Captured #{i+1}")
            except Exception as e:
                print(f"    Error #{i+1}: {e}")

    return metadata

def main():
    print("=" * 60)
    print("  DESIGN INSPIRATION SCRAPER")
    print("=" * 60)

    setup_output_dirs()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        )
        page = context.new_page()

        all_metadata = []
        for source in SOURCES:
            try:
                meta = scrape_source(page, source)
                all_metadata.extend(meta)
            except Exception as e:
                print(f"  FAILED: {e}")

        browser.close()

    metadata_path = os.path.join(OUTPUT_DIR, "metadata.json")
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(all_metadata, f, indent=2, ensure_ascii=False)

    print(f"\n{'=' * 60}")
    print(f"  COMPLETED: {len(all_metadata)} captures across {len(CATEGORIES)} categories")
    print(f"  Output: {OUTPUT_DIR}")
    print(f"  Metadata: {metadata_path}")
    print(f"{'=' * 60}")

if __name__ == "__main__":
    main()
