#!/bin/bash
cd "$(dirname "$0")"
pip install -r requirements.txt -q
gunicorn -w 4 -b 0.0.0.0:5001 --timeout 120 wsgi:app
