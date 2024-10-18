import os
import smtplib
import csv
import sys
import json
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from jinja2 import Template
import click
import time


SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT"))
EMAIL_ADDRESS = os.getenv("USERNAME")
USERNAME = os.getenv("USERNAME")
PASSWORD = os.getenv("PASSWORD")


CONTACT_FIELDS = {
    'first_name': 13,
    'last_name': 14,
    'department': 15,
    'position': 16,
    'organization': 3,
    'email_address': 1
}


class EmailServer:
    def __init__(self):
        self.server = None

    def __enter__(self):
        try:
            self.server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
            self.server.starttls()  # Use TLS encryption
            self.server.login(USERNAME, PASSWORD)
            return self.server
        except Exception as e:
            print(f"Failed to connect to email server: {str(e)}")
            raise

    def __exit__(self, exc_type, exc_value, traceback):
        if self.server:
            self.server.quit()


def read_contacts(name: str):
    csv_file = os.path.abspath(os.path.join(os.path.dirname(__file__), name, "contacts.csv"))
    contacts = []
    with open(csv_file, 'r') as file:
        csv_reader = csv.reader(file)
        for row in csv_reader:
            contacts.append(row)
    return contacts


def read_file(folder, filename):
    filepath = os.path.join(folder, filename)
    f = open(filepath, "r")
    return f.read()


def read_templates(name: str):
    campaign_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), name))
    subject_text = read_file(campaign_folder, "subject.txt")
    subject_template = Template(subject_text)
    body_text = read_file(campaign_folder, "body.html")
    body_template = Template(body_text)
    return subject_template, body_template

def run_campaign(name: str, test: bool = False, start_index: int = 0, limit: int = None):
    campaign_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), name))
    if not os.path.exists(campaign_folder):
        raise Exception(f"campaign not found. No folder named: {name}")
    
    if test:
        contacts = [
            ["", "todd@100-x.ai", "", "", "", "", "", "", "", "", "", "", "", "Todd", "Cullen", "Exec", "CEO", ""],
        ]
    else:
        click.confirm("Are you sure you want to run this campaign?", abort=True)
        contacts = read_contacts(name)
        contacts = contacts[1+start_index:]  # Skip header row
        if limit is not None:
            contacts = contacts[:limit]

    subject_template, body_template = read_templates(name)

    contact_count = len(contacts)
    print(f"Starting to send emails. Count: {contact_count}")
    with EmailServer() as server:
        count = 0
        for contact in contacts:
            print(f"Contact: {contact}")
            context = {}
            for prop in CONTACT_FIELDS:
                context[prop] = contact[CONTACT_FIELDS[prop]]
            
            subject = subject_template.render(context)
            body = body_template.render(context)

            recipient_email = context["email_address"]

            msg = MIMEMultipart()
            msg['From'] = EMAIL_ADDRESS
            msg['To'] = recipient_email
            msg['Subject'] = subject

            # Attach the body of the email
            msg.attach(MIMEText(body, 'html'))

            text = msg.as_string()
            server.sendmail(EMAIL_ADDRESS, recipient_email, text)
            count += 1
            print(f"Sent Email. {count}/{contact_count}")
            time.sleep(1.0)  # Add a second delay between each email sent
    print(f"All emails sent")


@click.command()
@click.argument('campaign_name', required=True)
@click.option('--test', is_flag=True, help='Run in test mode')
@click.option('--start-index', default=0, help='Start processing contacts from this index')
@click.option('--limit', default=None, type=int, help='Limit the number of contacts to process')
def main(campaign_name, test, start_index, limit):
    """Run an email campaign."""
    if test:
        print(f"Running campaign '{campaign_name}' in test mode")
    else:
        print(f"Running campaign '{campaign_name}'")
    run_campaign(campaign_name, test, start_index, limit)


if __name__ == '__main__':
    main()
