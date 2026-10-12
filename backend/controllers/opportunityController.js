const db = require('../config/db');

// GET all research opportunities
async function getAllOpportunities(req, res) {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM opportunities ORDER BY id DESC'
        );

        return res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error(error.message);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

// GET one opportunity by ID
async function getOpportunityById(req, res) {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid opportunity ID'
        });
    }

    try {
        const [rows] = await db.execute(
            'SELECT * FROM opportunities WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Opportunity not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

// PUT update opportunity
async function updateOpportunity(req, res) {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid opportunity ID'
        });
    }

    try {
        const [rows] = await db.execute(
            'SELECT * FROM opportunities WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Opportunity not found'
            });
        }

        const changes = req.body;

        const allowed = [
            'title', 'description', 'research_area',
            'faculty_name', 'department', 'required_skills',
            'available_positions', 'application_deadline', 'status'
        ];

        if (
            !changes ||
            typeof changes !== 'object' ||
            Array.isArray(changes) ||
            Object.keys(changes).length === 0 ||
            Object.keys(changes).some(key => !allowed.includes(key))
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid update fields'
            });
        }

        const data = { ...rows[0], ...changes };

        // Normalize existing MySQL DATE values if necessary
        if (data.application_deadline instanceof Date) {
            data.application_deadline =
                data.application_deadline.toISOString().slice(0, 10);
        }

        // Reuse the same validation as the POST endpoint
        const requiredText = [
            'title', 'description', 'research_area',
            'faculty_name', 'department', 'required_skills'
        ];

        const limits = {
            title: 200,
            description: 65535,
            research_area: 100,
            faculty_name: 150,
            department: 150,
            required_skills: 65535
        };

        for (const field of requiredText) {
            if (
                typeof data[field] !== 'string' ||
                !data[field].trim() ||
                data[field].length > limits[field]
            ) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid or missing field: ${field}`
                });
            }
        }

        const date = data.application_deadline;

        if (
            typeof date !== 'string' ||
            !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
            !Number.isFinite(Date.parse(date)) ||
            new Date(date).toISOString().slice(0, 10) !== date
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid application deadline'
            });
        }

        if (!Number.isInteger(data.available_positions) ||
            data.available_positions <= 0 ||
            !['Open', 'Closed'].includes(data.status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid positions or status'
            });
        }

        await db.execute(
            `UPDATE opportunities SET
             title=?, description=?, research_area=?,
             faculty_name=?, department=?, required_skills=?,
             available_positions=?, application_deadline=?,
             status=? WHERE id=?`,
            [
                data.title.trim(),
                data.description.trim(),
                data.research_area.trim(),
                data.faculty_name.trim(),
                data.department.trim(),
                data.required_skills.trim(),
                data.available_positions,
                date,
                data.status,
                id
            ]
        );

        return res.status(200).json({
            success: true,
            message: 'Opportunity updated successfully'
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

// DELETE opportunity
async function deleteOpportunity(req, res) {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid opportunity ID'
        });
    }

    try {
        const [result] = await db.execute(
            'DELETE FROM opportunities WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Opportunity not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Opportunity deleted successfully'
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}
// POST /api/opportunities
async function createOpportunity(req, res) {
    const data = req.body || {};

    const required = [
        'title',
        'description',
        'research_area',
        'faculty_name',
        'department',
        'required_skills'
    ];

    for (const field of required) {
        if (typeof data[field] !== 'string' || !data[field].trim()) {
            return res.status(400).json({
                success: false,
                message: `Invalid or missing field: ${field}`
            });
        }
    }

    if (!Number.isInteger(data.available_positions) ||
        data.available_positions <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Available positions must be a positive integer'
        });
    }

    const date = data.application_deadline;

    if (
        typeof date !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        Number.isNaN(Date.parse(date)) ||
        new Date(date).toISOString().slice(0, 10) !== date
    ) {
        return res.status(400).json({
            success: false,
            message: 'Invalid application deadline'
        });
    }

    const status = data.status ?? 'Open';

    if (!['Open', 'Closed'].includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid status'
        });
    }

    try {
        const [result] = await db.execute(
            `INSERT INTO opportunities
            (title, description, research_area, faculty_name,
             department, required_skills, available_positions,
             application_deadline, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.title.trim(),
                data.description.trim(),
                data.research_area.trim(),
                data.faculty_name.trim(),
                data.department.trim(),
                data.required_skills.trim(),
                data.available_positions,
                date,
                status
            ]
        );

        return res.status(201).json({
            success: true,
            message: 'Opportunity created successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error(error.message);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}
module.exports = {
    getAllOpportunities,
    getOpportunityById,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity
};