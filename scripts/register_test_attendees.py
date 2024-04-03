import json
import random
import requests
import sys

from dataclasses import dataclass, asdict
from pathlib import Path


@dataclass
class TestData:
    name: str
    email: str


def load_test_data(filepath: Path) -> list[TestData]:
    with open(filepath, 'r') as f:
        data = json.load(f)

    return [TestData(**item) for item in data]


def insert_test_attendees(event_id: str, data: list[TestData]):
    data_length = len(data)
    idx_to_be_checked_in = random.sample(range(data_length), k=int(data_length * .66))

    base_url = 'http://localhost:3333'

    register_for_event_url = f'{base_url}/events/{event_id}/attendees'

    for idx, item in enumerate(data):
        res = requests.post(register_for_event_url, json=asdict(item))

        if res.status_code != 201:
            print(f'ERROR: url: "${register_for_event_url}" response: ${res.json()}')
            continue
            
        if idx in idx_to_be_checked_in:
            attendee_id = res.json()['attendeeId']
            check_in_url = f'{base_url}/attendees/{attendee_id}/check-in'

            res = requests.get(check_in_url)

            if res.status_code != 201:
                print(f'ERROR: url: "${check_in_url}" response: ${res.json()}')


if __name__ == '__main__':
    event_id = sys.argv[1]
    data = load_test_data(Path('test_attendees.json'))
    insert_test_attendees(event_id, data)