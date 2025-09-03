import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './src/routes/authRoutes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('Backend is running'));
app.use('/auth', authRoutes);

app.listen(process.env.PORT || 4000, () => {
  console.log(`Server running`);
});