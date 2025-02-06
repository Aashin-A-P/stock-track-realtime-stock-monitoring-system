import { Request, Response, NextFunction } from 'express';
 

export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const type = req.query.type as string || 'default'; // e.g., 'product' or 'transfer-letter'
        const imageUrl = `/uploads/${type}/${req.file.filename}`; // Construct file URL with type

        res.status(200).json({
            message: 'Image uploaded successfully',
            imageUrl,
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
