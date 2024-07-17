import os
import csv
import urllib.request
from urllib.error import URLError, HTTPError

# Function to download files using urllib
def download_file(url, dest_folder):
    if not os.path.exists(dest_folder):
        os.makedirs(dest_folder)
    
    local_filename = url.split('/')[-1]
    local_path = os.path.join(dest_folder, local_filename)
    
    try:
        urllib.request.urlretrieve(url, local_path)
        return local_path
    except (URLError, HTTPError) as e:
        raise RuntimeError(f"Error downloading {url}: {e}")

# Directory containing CSV files
csv_files_folder = 'files'
# Destination folder for downloads
dest_folder = 'downloads'

# List of allowed file extensions
allowed_extensions = {'.zip', '.csv', '.xlsx', '.xls'}

# Iterate over all CSV files in the specified directory
for csv_file_name in os.listdir(csv_files_folder):
    if csv_file_name.endswith('.csv'):
        csv_file_path = os.path.join(csv_files_folder, csv_file_name)
        with open(csv_file_path, mode='r') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                url = row['URL']
                title = row['Title']
                file_extension = os.path.splitext(url)[1]
                if file_extension in allowed_extensions:
                    print(f'Downloading: {title}')
                    try:
                        download_file(url, dest_folder)
                        print(f'Successfully downloaded: {url}')
                    except Exception as e:
                        print(f'Failed to download {url}: {e}')
                else:
                    print(f'Skipping file with unsupported extension: {url}')

print('All files have been processed.')
