import patientService from "../services/patientService.js";

class PatientController {

    async create(req, res, next) {
        try {
            const patient = await patientService.create(req.body);
            return res.status(201).json(patient);
        } catch (err) {
            next(err);
        }
    }

    async findAll(req, res, next) {
        try {
            let patients;
            if (req.user.role === 'PATIENT') {
            // Busca o paciente associado ao userId do token
            const patient = await patientService.findByUserId(req.user.id);
            patients = patient ? [patient] : [];
            } else {
            // ADMIN ou DOCTOR listam todos
            patients = await patientService.findAll();
            }
            res.json(patients);
        } catch (err) { next(err); }
    }

    async findById(req, res, next) {
        try {
            const patient = await patientService.findById(req.params.id);
            return res.json(patient);
        } catch (err) {
            next(err);
        }
    }

    async update(req, res, next) {
        try {
            const patient = await patientService.update(
                req.params.id,
                req.body
            );
            return res.json(patient);
        } catch (err) {
            next(err);
        }
    }

    async delete(req, res, next) {
        try {
            await patientService.delete(req.params.id);
            return res.json({ message: "Patient deleted" });
        } catch (err) {
            next(err);
        }
    }
}

export default new PatientController();