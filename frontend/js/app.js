const API = '/api/opportunities';

const form = document.getElementById('opportunityForm');
const list = document.getElementById('opportunitiesList');
const messageBox = document.getElementById('message');
const detailsSection = document.getElementById('detailsSection');
const detailsContent = document.getElementById('detailsContent');

const fields = [
    'title', 'description', 'research_area', 'faculty_name',
    'department', 'required_skills', 'available_positions',
    'application_deadline', 'status'
];

function showMessage(text, type = 'success') {
    messageBox.className = `alert alert-${type}`;
    messageBox.textContent = text;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function apiRequest(url, options = {}) {
    let response;

    try {
        response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
    } catch {
        throw new Error('Cannot connect to the server.');
    }

    let result;
    try {
        result = await response.json();
    } catch {
        throw new Error('Unexpected server response.');
    }

    if (!response.ok || result.success === false) {
        throw new Error(result.message || 'Request failed.');
    }

    return result;
}

function makeButton(label, style, handler) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `btn btn-sm ${style}`;
    button.textContent = label;
    button.addEventListener('click', handler);
    return button;
}

function addText(parent, tag, content, className = '') {
    const element = document.createElement(tag);
    element.textContent = content;
    if (className) element.className = className;
    parent.appendChild(element);
    return element;
}

function resetForm() {
    form.reset();
    document.getElementById('opportunityId').value = '';
    document.getElementById('formTitle').textContent = 'Create Opportunity';
    document.getElementById('saveButton').textContent = 'Create Opportunity';
}

function getFormData() {
    const data = {};

    for (const field of fields) {
        data[field] = document.getElementById(field).value.trim();
    }

    data.available_positions = Number(data.available_positions);
    return data;
}

async function loadOpportunities() {
    list.textContent = 'Loading opportunities...';

    try {
        const result = await apiRequest(API);
        list.replaceChildren();

        if (result.data.length === 0) {
            addText(list, 'p', 'No research opportunities available yet.', 'text-muted');
            return;
        }

        for (const opportunity of result.data) {
            const card = document.createElement('div');
            card.className = 'opportunity-item';

            addText(card, 'h3', opportunity.title);
            addText(card, 'p',
                `${opportunity.research_area} • ${opportunity.department}`);

            const badge = addText(
                card, 'span', opportunity.status,
                `badge mb-3 ${opportunity.status === 'Open'
                    ? 'bg-success' : 'bg-secondary'}`
            );

            const info = document.createElement('div');
            info.className = 'small text-muted mb-3';
            info.textContent =
                `Faculty: ${opportunity.faculty_name} | ` +
                `Positions: ${opportunity.available_positions} | ` +
                `Deadline: ${String(opportunity.application_deadline).slice(0, 10)}`;
            card.appendChild(info);

            const buttons = document.createElement('div');
            buttons.className = 'action-buttons';

            buttons.appendChild(makeButton('View', 'btn-outline-primary',
                () => viewOpportunity(opportunity.id)));

            buttons.appendChild(makeButton('Edit', 'btn-outline-secondary',
                () => editOpportunity(opportunity.id)));

            if (opportunity.status === 'Open') {
                buttons.appendChild(makeButton('Close', 'btn-outline-warning',
                    () => closeOpportunity(opportunity.id)));
            }

            buttons.appendChild(makeButton('Delete', 'btn-outline-danger',
                () => deleteOpportunity(opportunity.id)));

            card.appendChild(buttons);
            list.appendChild(card);
        }
    } catch (error) {
        list.textContent = 'Unable to load opportunities.';
        showMessage(error.message, 'danger');
    }
}

async function viewOpportunity(id) {
    try {
        const result = await apiRequest(`${API}/${id}`);
        const o = result.data;

        detailsContent.replaceChildren();

        const labels = {
            id: 'ID',
            title: 'Title',
            description: 'Description',
            research_area: 'Research Area',
            faculty_name: 'Faculty',
            department: 'Department',
            required_skills: 'Required Skills',
            available_positions: 'Positions',
            application_deadline: 'Deadline',
            status: 'Status'
        };

        for (const [key, label] of Object.entries(labels)) {
            const paragraph = document.createElement('p');
            const strong = document.createElement('strong');
            strong.textContent = `${label}: `;
            paragraph.appendChild(strong);

            const value = key === 'application_deadline'
                ? String(o[key]).slice(0, 10)
                : String(o[key] ?? '');

            paragraph.appendChild(document.createTextNode(value));
            detailsContent.appendChild(paragraph);
        }

        detailsSection.hidden = false;
        detailsSection.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        showMessage(error.message, 'danger');
    }
}

async function editOpportunity(id) {
    try {
        const result = await apiRequest(`${API}/${id}`);
        const o = result.data;

        for (const field of fields) {
            const value = field === 'application_deadline'
                ? String(o[field]).slice(0, 10)
                : o[field];

            document.getElementById(field).value = value;
        }

        document.getElementById('opportunityId').value = id;
        document.getElementById('formTitle').textContent = 'Edit Opportunity';
        document.getElementById('saveButton').textContent = 'Save Changes';

        form.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        showMessage(error.message, 'danger');
    }
}

async function closeOpportunity(id) {
    if (!confirm('Close this research opportunity?')) return;

    try {
        await apiRequest(`${API}/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'Closed' })
        });

        showMessage('Opportunity closed successfully.');
        detailsSection.hidden = true;
        await loadOpportunities();
    } catch (error) {
        showMessage(error.message, 'danger');
    }
}

async function deleteOpportunity(id) {
    if (!confirm('Permanently delete this opportunity?')) return;

    try {
        await apiRequest(`${API}/${id}`, { method: 'DELETE' });

        showMessage('Opportunity deleted successfully.');
        detailsSection.hidden = true;

        if (document.getElementById('opportunityId').value === String(id)) {
            resetForm();
        }

        await loadOpportunities();
    } catch (error) {
        showMessage(error.message, 'danger');
    }
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const id = document.getElementById('opportunityId').value;
    const data = getFormData();
    const button = document.getElementById('saveButton');

    button.disabled = true;

    try {
        await apiRequest(id ? `${API}/${id}` : API, {
            method: id ? 'PUT' : 'POST',
            body: JSON.stringify(data)
        });

        showMessage(id
            ? 'Opportunity updated successfully.'
            : 'Opportunity created successfully.');

        resetForm();
        detailsSection.hidden = true;
        await loadOpportunities();
    } catch (error) {
        showMessage(error.message, 'danger');
    } finally {
        button.disabled = false;
    }
});

document.getElementById('cancelButton')
    .addEventListener('click', resetForm);

document.getElementById('refreshButton')
    .addEventListener('click', loadOpportunities);

loadOpportunities();
