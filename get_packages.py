# pip install requests bs4 pypistats

import requests
from bs4 import BeautifulSoup
import pypistats
from dataclasses import dataclass
import json
import time
import sys
from typing import Iterator
from pathlib import Path

DOCS_URL = 'https://youtype.github.io/boto3_stubs_docs/'
JSON_URL = 'https://pypi.org/pypi/{}/json'
PREFIX = 'mypy-boto3-'

@dataclass
class Package:
    name: str
    description: str
    downloads: int = 0

    @property
    def service_name(self) -> str:
        if not self.description:
            return self.name

        return self.description.split("boto3.")[-1].split()[0]

    def print(self) -> str:
        return f"new ServicePackage('{self.name}', '{self.service_name}', {self.downloads}),"

def iterate_packages() -> Iterator[Package]:
    r = requests.get(DOCS_URL)
    soup = BeautifulSoup(r.text, 'html.parser')
    for snippet in soup.select('a[href^="mypy_boto3_"]'):
        if not snippet.parent:
            continue
        docs_link = snippet.parent.select_one('a[href*="https://boto3."]')
        if not docs_link:
            continue

        name: str = snippet.text
        if not name.startswith(PREFIX):
            continue
        description: str = docs_link.text
        yield Package(name=name, description=description)


def get_downloads(name: str) -> int:
    data = '{"data": {"last_month": 0}}'
    while True:
        try:
            data = pypistats.recent(name, "month", format="json")
            break
        except Exception as e:
            sys.stderr.write(f"Retrying {name} in 10s: {e}")
            time.sleep(10)
    return json.loads(data)["data"]["last_month"]

def main() -> None:
    output_path = Path(__file__).parent / "src" / "servicePackages.ts"
    print(f"Writing to {output_path.as_posix()}...")
    packages: list[Package] = []
    for counter, package in enumerate(iterate_packages()):
        package.downloads = get_downloads(package.name)
        packages.append(package)
        print(f"Processed {counter}: {package.name} - {package.downloads} downloads")

    # packages.sort(key=lambda x: x.name)
    packages.sort(key=lambda x: x.downloads, reverse=True)

    with output_path.open('w') as f:
        f.write("import { ServicePackage } from './servicePackage'\n\n")
        f.write("export const servicePackages: ServicePackage[] = [\n")
        for package in packages:
            f.write(f"  {package.print()}\n")
        f.write("];\n")

if __name__ == "__main__":
    main()