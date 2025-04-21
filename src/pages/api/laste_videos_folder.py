import os

def list_files_and_folders(directory):
    try:
        # Get the list of files and folders
        items = os.listdir(directory)
        return items
    except Exception as e:
        return str(e)

# Example usage
if __name__ == "__main__":
    directory = os.path.join(os.getcwd(), 'public', 'videos_uploaded')
    items = list_files_and_folders(directory)
    print(items)
