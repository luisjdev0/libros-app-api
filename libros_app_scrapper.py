#pip install requests beautifulsoup4 lxml
import requests
import sys
from mysql import connector
from bs4 import BeautifulSoup

#Book Model
class Book:
    def __init__(
        self,
        pageID,
        imageURL,
        title,
        author,
        genres,
        summary,
        epub,
        pdf
    ):
        self.pageID   = pageID
        self.imageURL = imageURL
        self.title    = title
        self.author   = author
        self.genres   = genres
        self.summary  = summary
        self.epub     = epub
        self.pdf      = pdf


def getRequest(uri, check_status = False):
    try:
        data = requests.get(uri, headers={"User-Agent": "Lynx/2.8.8"})
        if (check_status and data.status_code == 404):
            exit()

        return data
    except:
        return None

def saveBook(book : Book):
    connection = connector.connect(
        host = 'localhost',
        user = 'libros_app_user',
        password = 'libros_admin',
        database = 'libros_app'
    )

    cursor = connection.cursor()

    cursor.execute('INSERT IGNORE INTO books (id, pageID, imageURL, title, author, genres, summary, epub, pdf) VALUES (null, %s, %s, %s, %s, %s, %s, %s, %s)', (
        book.pageID,
        book.imageURL,
        book.title,
        book.author,
        '|'.join(book.genres),
        book.summary,
        book.epub,
        book.pdf
    ))

    if (cursor.rowcount == 0):
        cursor.execute('UPDATE books SET pageID=%s, imageURL=%s, genres=%s, summary=%s, epub=%s, pdf=%s WHERE title=%s AND author=%s', (
            book.pageID,
            book.imageURL,
            '|'.join(book.genres),
            book.summary,
            book.epub,
            book.pdf,
            book.title,
            book.author
        ))

    cursor.close()
    connection.commit()
    connection.close()

def getBook(uri, page, api_base):
    
    try:
        book_data = getRequest(uri)

        if book_data != None:
            book_soup = BeautifulSoup(book_data.text, 'lxml')

            book_title = book_soup.find('div', {'id' : 'title'}).h1.get_text()
            book_image = book_soup.find('div', { 'id' : 'cover' }).img['src']
            book_author = book_soup.find('div', {'id' : 'autor'}).a.get_text()

            book_genres = []
            
            for tag in book_soup.find(
                'div', {'id': 'genero'}
                ).find_all('a', {'class' : 'dinSource'}):
                book_genres.append(tag.get_text())

            book_summary = book_soup.find('div', {'id' : 'sinopsis'}).get_text()
            donwloads = book_soup.find('div', {'id' : 'downloadContainer'}).find_all('a')
            book_epub = donwloads[0]['href']
            book_pdf = donwloads[1]['href']

            book = Book(
                page,
                book_image,
                book_title,
                book_author,
                book_genres,
                book_summary,
                f'{api_base}{book_epub}',
                f'{api_base}{book_pdf}'
            )

            saveBook(book)
    except Exception as e:
        print(book_title)
        print(e)

#Get Books Lists 
current_page_index = 1
last_page = -1
if (len(sys.argv) > 1 and sys.argv[1].isdigit()):
    current_page_index = int(sys.argv[1])

if (len(sys.argv) > 2 and sys.argv[2].isdigit()):
    last_page = int(sys.argv[2])

api_base = 'https://www.lectulandia.co'

while current_page_index <= last_page or last_page == -1:
    endpoint_uri = f'{api_base}/book/page/{current_page_index}'
    print(endpoint_uri)
    response = getRequest(endpoint_uri)

    if response != None:
        soup = BeautifulSoup(response.text, 'lxml')
        page_books = soup.find_all('a', { 'class' : 'card-click-target' })

        for book in page_books:
            book_uri = f'{api_base}{book["href"]}'
            getBook(book_uri, current_page_index, api_base)
            
    current_page_index += 1