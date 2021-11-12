import requests
from bs4 import BeautifulSoup
import pypistats
from dataclasses import dataclass
import json
import time
import sys
from typing import Iterator

API_URL = 'https://pypi.org/search/'
JSON_URL = 'https://pypi.org/pypi/{}/json'
PREFIX = 'mypy-boto3-'
AUTHOR = "Vlad Emelianov"

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
    session = requests.Session()
    package_names = []
    for page in range(1, 50):
        params = {'q': PREFIX, 'page': page}
        r = session.get(API_URL, params=params)
        soup = BeautifulSoup(r.text, 'html.parser')
        for snippet in soup.select('a[class*="snippet"]'):
            name: str = snippet.select_one('span[class*="name"]').text.strip() # type: ignore
            description: str = snippet.select_one('p[class*="description"]').text.strip() # type: ignore
            if not name.startswith(PREFIX) or name in package_names:
                continue
            if not description.startswith("Type annotations for boto3"):
                continue
            

            package_names.append(name)
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
            pass
    return json.loads(data)["data"]["last_month"]

def main() -> None:
    for package in iterate_packages():
        package.downloads = get_downloads(package.name)

        print(package.print())

if __name__ == "__main__":
    main()