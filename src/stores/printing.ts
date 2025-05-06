import { onMounted } from "vue";
import { defineStore } from "pinia";
import axios from 'axios';
import pdfMake from "pdfmake/build/pdfmake";
import htmlToPdfmake from "html-to-pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import type { Alignment, PageOrientation } from "pdfmake/interfaces";

export const usePrintingStore = defineStore("printing", () => {

  async function loadPdfFonts() {
    pdfMake.vfs = pdfFonts.vfs; // Dynamically load fonts
  }

  onMounted(() => {
    console.log("onMounted printing loadPdfFonts");
    loadPdfFonts();
  });

  
  async function saveAsPDF(fileName: string, sourceContent: string, urlPrinting: string, sourceContent2?: string): Promise<string | true> {

    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      // console.log("content1>>>>> ", sourceContent); console.log("content2>>>>> ", sourceContent2);

      if (!sourceContent) {
        console.error("Print content not found!");
        reject("ERROR_CREATE");
        return;
      }

      const htmlContent = convertHtmlToPdfContent(sourceContent);
      if (!htmlContent) {
        reject("ERROR_CREATE");
        return;
      }
      let htmlContent2;

      if (fileName.includes("Diagramm") && sourceContent2) {
        const svgElement = document.getElementById("diagramId");
        if (svgElement) {
          htmlContent2 = await convertSvgToPdfMake(document.getElementById("diagramId"));
        } else {
          console.error("SVG element with id 'diagramId' not found in sourceContent2.");
          reject("ERROR_CREATE");
          return;
        }
      } else {
        htmlContent2 = convertHtmlToPdfContent(sourceContent2 ?? "");
      }

      const docDefinition = {
        content: [htmlContent, htmlContent2],
        pageOrientation: fileName.includes("Diagramm") ? 'landscape' : 'portrait' as PageOrientation,
        styles: {
          header: { fontSize: 12, bold: false },
        },
      };

      pdfMake.createPdf(docDefinition).getBlob(async (pdfBlob) => {
        try {
          await downloadFile(fileName, pdfBlob, urlPrinting);
          resolve(true);
        } catch (error) {
          reject("ERROR_SEND");
          console.error("Error uploading PDF2:", error);
        }
      });
    });
  }

  function convertHtmlToPdfContent(htmlString: string): any {
    try {
      const cleanedHtml = preProcessHtml(htmlString);
      // console.log("cleanedHtml>>>>> ", cleanedHtml);
      const pdfContent = htmlToPdfmake(cleanedHtml);
      // console.log("htmlContent>>>>> ", pdfContent);
      return pdfContent;
    } catch (error) {
      console.error("Error converting HTML to PDFMake format:", error);
      console.error("Problematic HTML content:", htmlString);
      return error;
    }
  }

  const convertSvgToPdfMake = (svgElement: any) => {
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgElement);
    
    return {
      svg: svgStr,
      width: 750, // Adjust to fit the page
      alignment: "center" as Alignment,
    };
  };

  async function downloadFile(fileName: string, blob: Blob, urlPrinting: string) {
    try {
      const formData = new FormData();
      formData.append("file", blob, fileName);

      const response = await axios.post("http:" + urlPrinting + "/api/upload/pdf", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Upload successful:", response.data);
    } catch (error) {
      console.error("Error uploading PDF1:", error);
      throw error;
    }
  }

  const preProcessHtml = (html: string): string => {
    let processedHtml = html;

    // Convert Ionic-specific components to regular HTML
    processedHtml = processedHtml.replace(/<ion-app>/g, '<div>');
    processedHtml = processedHtml.replace(/<\/ion-app>/g, '</div>');
    processedHtml = processedHtml.replace(/<ion-content[^>]*>/g, '<div>');
    processedHtml = processedHtml.replace(/<\/ion-content>/g, '</div>');
    processedHtml = processedHtml.replace(/<ion-grid[^>]*>/g, '<table style="width:100%; border: none;">');
    processedHtml = processedHtml.replace(/<\/ion-grid>/g, '</table>');
    processedHtml = processedHtml.replace(/<ion-row[^>]*>/g, '<tr style="border: none;">');
    processedHtml = processedHtml.replace(/<\/ion-row>/g, '</tr>');
    processedHtml = processedHtml.replace(/<ion-col[^>]*>/g, '<td >');
    processedHtml = processedHtml.replace(/<\/ion-col>/g, '</td>');
    processedHtml = processedHtml.replace(/<ion-label[^>]*>/g, '<label>');
    processedHtml = processedHtml.replace(/<\/ion-label>/g, '</label>');
    processedHtml = processedHtml.replace(/<ion-button[^>]*>/g, '<button>');
    processedHtml = processedHtml.replace(/<\/ion-button>/g, '</button>');
    processedHtml = processedHtml.replace(/<ion-list[^>]*>/g, '<ul>');
    processedHtml = processedHtml.replace(/<\/ion-list>/g, '</ul>');
    processedHtml = processedHtml.replace(/<ion-item[^>]*>/g, '<li>');
    processedHtml = processedHtml.replace(/<\/ion-item>/g, '</li>');
    processedHtml = processedHtml.replace(/<ion-input[^>]*>/g, '<input>');
    processedHtml = processedHtml.replace(/<\/ion-input>/g, '</input>');
    processedHtml = processedHtml.replace(/<ion-textarea[^>]*>/g, '<textarea>');
    processedHtml = processedHtml.replace(/<\/ion-textarea>/g, '</textarea>');

    processedHtml = processedHtml.replace(/ data-v-[a-z0-9]+=""/g, '');

    return processedHtml;
  };

  return { 
    saveAsPDF
  };
});