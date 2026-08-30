import fs from 'fs';
import path from 'path';

const MONTH_NAMES = [
  '01-Enero',
  '02-Febrero',
  '03-Marzo',
  '04-Abril',
  '05-Mayo',
  '06-Junio',
  '07-Julio',
  '08-Agosto',
  '09-Septiembre',
  '10-Octubre',
  '11-Noviembre',
  '12-Diciembre'
];

export class FileStorageService {
  private baseStorageDir: string;
  private historyStorageDir: string;

  constructor() {
    this.baseStorageDir = path.join(process.cwd(), 'storage', 'facturas');
    this.historyStorageDir = path.join(process.cwd(), 'storage', 'historico');
    this.ensureBaseDirectories();
  }

  /**
   * Garantiza la creación de la estructura base /storage/facturas/YYYY/MM-Mes/
   */
  public ensureBaseDirectories(year: number = new Date().getFullYear()) {
    if (!fs.existsSync(this.baseStorageDir)) {
      fs.mkdirSync(this.baseStorageDir, { recursive: true });
    }
    if (!fs.existsSync(this.historyStorageDir)) {
      fs.mkdirSync(this.historyStorageDir, { recursive: true });
    }

    // Crear las 12 carpetas del año especificado
    const yearDir = path.join(this.baseStorageDir, year.toString());
    if (!fs.existsSync(yearDir)) {
      fs.mkdirSync(yearDir, { recursive: true });
    }

    MONTH_NAMES.forEach(month => {
      const monthDir = path.join(yearDir, month);
      if (!fs.existsSync(monthDir)) {
        fs.mkdirSync(monthDir, { recursive: true });
      }
    });
  }

  /**
   * Limpia nombres de carpeta o archivo eliminando caracteres especiales e inseguros
   */
  public sanitizeName(name: string): string {
    return name
      .replace(/[\/\\:\*\?"<>\|]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  /**
   * Genera el mes formateado tipo "08-Agosto"
   */
  public getMonthFolder(date: Date = new Date()): string {
    const monthIndex = date.getMonth();
    return MONTH_NAMES[monthIndex];
  }

  /**
   * Construye y asegura la ruta completa física de almacenamiento para un registro
   */
  public getTargetDirectory(supplierName: string, documentCode: string, date: Date = new Date()): { absoluteDir: string; relativeDir: string } {
    const year = date.getFullYear();
    const monthFolder = this.getMonthFolder(date);
    const cleanSupplier = this.sanitizeName(supplierName);
    const cleanCode = this.sanitizeName(documentCode);

    const relativeDir = path.join('/storage', 'facturas', year.toString(), monthFolder, cleanSupplier, cleanCode).replace(/\\/g, '/');
    const absoluteDir = path.join(this.baseStorageDir, year.toString(), monthFolder, cleanSupplier, cleanCode);

    if (!fs.existsSync(absoluteDir)) {
      fs.mkdirSync(absoluteDir, { recursive: true });
    }

    return { absoluteDir, relativeDir };
  }

  /**
   * Guarda un archivo en el servidor y retorna su ruta relativa
   */
  public saveFile(
    fileBuffer: Buffer,
    originalName: string,
    supplierName: string,
    documentCode: string,
    docType: 'QUOTATION' | 'INVOICE' | 'SIGNED_QUOTATION' | 'SIGNED_INVOICE' | 'OTHER',
    remissionDate: Date = new Date()
  ): { relativePath: string; absolutePath: string; storedName: string } {
    const ext = path.extname(originalName).toLowerCase();
    const cleanCode = this.sanitizeName(documentCode);

    let prefix = cleanCode;
    if (docType === 'SIGNED_QUOTATION') prefix += '-COT-FIRMADA';
    if (docType === 'SIGNED_INVOICE') prefix += '-FAC-FIRMADA';
    if (docType === 'QUOTATION' && !prefix.startsWith('COT-')) prefix = `COT-${prefix}`;
    if (docType === 'INVOICE' && !prefix.startsWith('FAC-')) prefix = `FAC-${prefix}`;

    const storedName = `${prefix}${ext}`;
    const { absoluteDir, relativeDir } = this.getTargetDirectory(supplierName, documentCode, remissionDate);

    const absolutePath = path.join(absoluteDir, storedName);
    const relativePath = path.join(relativeDir, storedName).replace(/\\/g, '/');

    fs.writeFileSync(absolutePath, fileBuffer);

    return { relativePath, absolutePath, storedName };
  }

  /**
   * Mueve un archivo anterior a la carpeta de histórico antes de reemplazar
   */
  public archiveOldFile(currentRelativePath: string): string | null {
    try {
      const currentAbsolutePath = path.join(process.cwd(), currentRelativePath);
      if (!fs.existsSync(currentAbsolutePath)) return null;

      const fileName = path.basename(currentAbsolutePath);
      const timestamp = new Date().toISOString().replace(/[:\.]/g, '-');
      const historyFileName = `${timestamp}_${fileName}`;
      const historyAbsolutePath = path.join(this.historyStorageDir, historyFileName);

      fs.copyFileSync(currentAbsolutePath, historyAbsolutePath);
      return path.join('/storage', 'historico', historyFileName).replace(/\\/g, '/');
    } catch (e) {
      console.error('Error al archivar archivo en histórico:', e);
      return null;
    }
  }
}

export const fileStorageService = new FileStorageService();
