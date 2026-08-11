import io
import zipfile
import xml.etree.ElementTree as ET
from typing import List
from backend.ingestion.models import ParsedPage

class DocumentParsingError(Exception):
    """Raised when document parsing fails."""
    pass

def parse_txt(file_bytes: bytes) -> List[ParsedPage]:
    try:
        text = file_bytes.decode('utf-8', errors='replace').strip()
        if not text:
            raise DocumentParsingError("Document is empty.")
        return [ParsedPage(page_number=1, text=text)]
    except Exception as e:
        raise DocumentParsingError(f"Failed to parse TXT document: {str(e)}")

def parse_markdown(file_bytes: bytes) -> List[ParsedPage]:
    return parse_txt(file_bytes)

def parse_pdf(file_bytes: bytes) -> List[ParsedPage]:
    try:
        import pypdf
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        pages = []
        for i, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            text = text.strip()
            if text:
                pages.append(ParsedPage(page_number=i + 1, text=text))
        if not pages:
            pages.append(ParsedPage(page_number=1, text="[Unreadable or empty PDF page content]"))
        return pages
    except Exception as e:
        text = file_bytes.decode('utf-8', errors='ignore').strip()
        if text:
            return [ParsedPage(page_number=1, text=text)]
        raise DocumentParsingError(f"Failed to parse PDF document: {str(e)}")

def parse_docx(file_bytes: bytes) -> List[ParsedPage]:
    """
    Pure Python DOCX parser using zipfile & xml.etree.ElementTree.
    Fallback to plain text parsing if binary ZIP structure is absent.
    """
    try:
        with zipfile.ZipFile(io.BytesIO(file_bytes)) as docx_zip:
            if 'word/document.xml' not in docx_zip.namelist():
                return parse_txt(file_bytes)
            xml_content = docx_zip.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            
            paragraphs = []
            for elem in tree.iter():
                if elem.tag.endswith('p'):
                    texts = [node.text for node in elem.iter() if node.tag.endswith('t') and node.text]
                    if texts:
                        paragraphs.append("".join(texts))
                        
            full_text = "\n\n".join(paragraphs).strip()
            if not full_text:
                return parse_txt(file_bytes)
            return [ParsedPage(page_number=1, text=full_text)]
    except zipfile.BadZipFile:
        return parse_txt(file_bytes)
    except Exception as e:
        text = file_bytes.decode('utf-8', errors='ignore').strip()
        if text:
            return [ParsedPage(page_number=1, text=text)]
        raise DocumentParsingError(f"Failed to parse DOCX document: {str(e)}")

def parse_document(file_name: str, file_bytes: bytes) -> List[ParsedPage]:
    ext = file_name.split('.')[-1].lower()
    if ext in ['txt', 'text']:
        return parse_txt(file_bytes)
    elif ext in ['md', 'markdown']:
        return parse_markdown(file_bytes)
    elif ext == 'pdf':
        return parse_pdf(file_bytes)
    elif ext in ['docx', 'doc']:
        return parse_docx(file_bytes)
    else:
        raise DocumentParsingError(f"Unsupported file format: .{ext}. Supported formats: PDF, DOCX, TXT, MD.")
