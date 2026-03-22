from jinja2 import Template
from docxtpl import DocxTemplate
from io import BytesIO

def generate_docx_report(data: dict, template_content: str) -> bytes:
    """
    Generates a DOCX report from a Jinja2 template string and data.
    template_content should be a string representing the content of a .docx file (XML-like) with Jinja2 syntax.
    For simplicity, let's assume a predefined template structure is stored.
    A more advanced setup would use docxtpl with a proper .docx template file or an in-memory template.
    """
    # In a real scenario, you'd likely have the raw .docx file content stored, not just a string.
    # Here, we simulate using a placeholder template path or in-memory generation.
    # A common approach is to save the template string as a temporary .docx file,
    # then use DocxTemplate. However, docxtpl usually works with files.
    # Let's assume template_content is a path to a real .docx template file for now.
    # If stored as text/XML, you'd need to reconstruct the .docx package.
    # For MVP, we'll use a simplified approach assuming a known template name.
    # This part needs refinement based on how templates are stored/manipulated.

    # Example: If template_content was a path like "templates/client_report.docx"
    # doc = DocxTemplate(template_content)
    # doc.render(data)
    # bio = BytesIO()
    # doc.save(bio)
    # bio.seek(0)
    # return bio.getvalue()

    # Simplified mock generation for now
    template_str = """{{ client_name }}, вот ваш отчет по тесту "{{ test_title }}".

Ответы:
{% for k, v in answers.items() %}
- {{ k }}: {{ v }}
{% endfor %}

Метрики:
{% for k, v in metrics.items() %}
- {{ k }}: {{ v }}
{% endfor %}

"""
    doc_template = Template(template_str)
    rendered_content = doc_template.render(**data)
    # Since we're mocking, return a simple string converted to bytes.
    # In reality, you'd use docxtpl as shown above.
    # Let's create a minimal fake docx structure for demonstration.
    fake_docx_content = f"Report for {data.get('client_name')}\n\n{rendered_content}".encode('utf-8')
    return fake_docx_content # Replace this with actual docxtpl logic


def generate_html_report(data: dict, template_content: str) -> str:
    """
    Generates an HTML report from a Jinja2 template string and data.
    """
    if not template_content:
        # Fallback template
        template_content = """
        <html>
            <body>
                <h1>Отчет для {{ client_name }}</h1>
                <h2>{{ test_title }}</h2>
                <h3>Ответы:</h3>
                <ul>
                {% for k, v in answers.items() %}
                    <li><strong>{{ k }}:</strong> {{ v }}</li>
                {% endfor %}
                </ul>

                <h3>Метрики:</h3>
                <ul>
                {% for k, v in metrics.items() %}
                    <li><strong>{{ k }}:</strong> {{ v }}</li>
                {% endfor %}
                </ul>
            </body>
        </html>
        """
    template = Template(template_content)
    return template.render(**data)