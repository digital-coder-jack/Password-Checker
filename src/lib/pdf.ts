/**
 * Builds a downloadable PDF security report from an analysis result.
 * The actual password is masked in the report — it is never embedded in full.
 */
import { jsPDF } from 'jspdf'
import type { AnalysisResult } from './types'
import { maskPassword } from './format'

const BRAND = '#6c5ce7'
const INK = '#1a1a2e'
const MUTED = '#6b7280'

export function generatePdfReport(result: AnalysisResult): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 48
  let y = margin

  // ---- Header band ------------------------------------------------------
  doc.setFillColor(BRAND)
  doc.rect(0, 0, pageWidth, 90, 'F')
  doc.setTextColor('#ffffff')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text('SecurePass Studio', margin, 42)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  doc.text('Password Security Report', margin, 64)
  y = 130

  // ---- Meta -------------------------------------------------------------
  doc.setTextColor(MUTED)
  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y)
  y += 30

  // ---- Headline result --------------------------------------------------
  doc.setTextColor(INK)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(`Strength: ${result.level.label}`, margin, y)
  doc.text(`${result.score}/100`, pageWidth - margin, y, { align: 'right' })
  y += 18

  // Score bar
  const barWidth = pageWidth - margin * 2
  doc.setFillColor('#e5e7eb')
  doc.roundedRect(margin, y, barWidth, 10, 5, 5, 'F')
  doc.setFillColor(BRAND)
  doc.roundedRect(margin, y, (barWidth * result.score) / 100, 10, 5, 5, 'F')
  y += 36

  // ---- Key metrics ------------------------------------------------------
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('Key Metrics', margin, y)
  y += 8
  doc.setDrawColor('#e5e7eb')
  doc.line(margin, y, pageWidth - margin, y)
  y += 20

  const metrics: [string, string][] = [
    ['Password (masked)', maskPassword(result.password)],
    ['Length', `${result.composition.length} characters`],
    ['Unique characters', `${result.composition.uniqueChars}`],
    ['Entropy', `${result.entropy.toFixed(1)} bits`],
    ['Character pool size', `${result.composition.poolSize}`],
    ['Lowercase', yesNo(result.composition.hasLowercase)],
    ['Uppercase', yesNo(result.composition.hasUppercase)],
    ['Numbers', yesNo(result.composition.hasNumbers)],
    ['Symbols', yesNo(result.composition.hasSymbols)],
  ]
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  for (const [key, value] of metrics) {
    doc.setTextColor(MUTED)
    doc.text(key, margin, y)
    doc.setTextColor(INK)
    doc.text(value, pageWidth - margin, y, { align: 'right' })
    y += 18
  }
  y += 14

  // ---- Crack-time scenarios --------------------------------------------
  y = sectionHeading(doc, 'Estimated Time to Crack', margin, pageWidth, y)
  const crack: [string, string][] = [
    ['Online attack (throttled, 100/s)', result.crackTime.display.onlineThrottled],
    ['Online attack (no throttle, 10k/s)', result.crackTime.display.onlineUnthrottled],
    ['Offline, slow hash (bcrypt, 10k/s)', result.crackTime.display.offlineSlowHash],
    ['Offline, fast hash (GPU, 100B/s)', result.crackTime.display.offlineFastHash],
  ]
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  for (const [key, value] of crack) {
    doc.setTextColor(MUTED)
    doc.text(key, margin, y)
    doc.setTextColor(INK)
    doc.text(value, pageWidth - margin, y, { align: 'right' })
    y += 18
  }
  y += 14

  // ---- Suggestions ------------------------------------------------------
  y = sectionHeading(doc, 'Recommendations', margin, pageWidth, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(INK)
  for (const suggestion of result.suggestions) {
    const lines = doc.splitTextToSize(`•  ${suggestion}`, pageWidth - margin * 2)
    doc.text(lines, margin, y)
    y += lines.length * 16
  }
  y += 18

  // ---- Footer -----------------------------------------------------------
  doc.setTextColor(MUTED)
  doc.setFontSize(9)
  doc.text(
    'This report was generated entirely in your browser. No password data was transmitted or stored.',
    margin,
    doc.internal.pageSize.getHeight() - 40,
    { maxWidth: pageWidth - margin * 2 },
  )

  doc.save('securepass-report.pdf')
}

function yesNo(value: boolean): string {
  return value ? 'Yes' : 'No'
}

function sectionHeading(
  doc: jsPDF,
  title: string,
  margin: number,
  pageWidth: number,
  y: number,
): number {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(INK)
  doc.text(title, margin, y)
  y += 8
  doc.setDrawColor('#e5e7eb')
  doc.line(margin, y, pageWidth - margin, y)
  return y + 20
}
