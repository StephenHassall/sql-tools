/**
 * SQL Template File
 * Used for loading in SQL templates.
 */
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { Path } from 'node:path';
import { SqlTemplate } from "./sql-template.js";

export class SqlTemplateFile {
    /**
     * Template map. The cache of templates
     */
    static _templateCache = new Map();

    /**
     * Get a template that is stored within a SQL file that has the given name. There need to be a "#template [name]...#endtemplate" in the file.
     * @param {String} name The name of the template. This is used to search for the template within the file.
     * @param {String} file Either the full path to the file or (if importMetaUrl is used) the relative path to the file.
     * @param {String} [importMetaUrl] The location of the module that is calling the function. This is used when working with relative paths.
     * @param {SqlConfig} [sqlConfig] The SQL config settings to use.
     * @param {Boolean} [cache=true] Is the SQL template cached so that it does not need to be read from the file next time.
     * @return {Promise} A promise that resolves the SQL template.
     */
    static async getTemplateByName(name, file, importMetaUrl, sqlConfig, cache) {
        // Check cache default value
        if (cache === undefined) cache = true;

        // Set full path
        let fullPath = file;

        // If using relative path
        if (importMetaUrl) {
            // Get calling file path
            const callingFile = fileURLToPath(importMetaUrl);

            // Get calling folder location
            const callingFolder = Path.dirname(callingFile);

            // Set the relative full path
            fullPath = Path.join(callingFolder, file);
        }

        // Set cache key
        let cacheKey;

        // If cache being used
        if (cache === true) {
            // Set cache key
            cacheKey = importMetaUrl + '-' + file + '-' + name;

            // If the template in the cache
            if (SqlTemplateFile._templateCache.has(cacheKey) === true) {
                // Get the cached SQL template object
                const sqlTemplate = SqlTemplateFile._templateCache.get(cacheKey);

                // Return a promise that resolves the SQL template
                return Promise.resolve(sqlTemplate);
            }
        }

        // Get file data
        const fileData = await readFile(fullPath, { encoding: 'utf8' });

        // Set the text to search for
        const searchTemplate = '#template ' + name;

        // Look for text
        let startIndex = fileData.indexOf(searchTemplate);

        // If not found
        if (startIndex === -1) {
            // Return a rejected promise
            return Promise.reject(Error('Template not found'));
        }

        // Look for end of template
        let endIndex = fileData.indexOf('#endtemplate', startIndex);

        // If not found
        if (endIndex === -1) {
            // Return a rejected promise
            return Promise.reject(Error('Missing endtemplate'));
        }

        // Adjust start of index
        startIndex += searchTemplate.length;

        // Check LF CR characters at the start
        if (fileData.charAt(startIndex) === '\n' || fileData.charAt(startIndex) === '\r') startIndex++;
        if (fileData.charAt(startIndex) === '\n' || fileData.charAt(startIndex) === '\r') startIndex++;

        // Check LF CR characters at the end
        if (fileData.charAt(endIndex - 1) === '\n' || fileData.charAt(endIndex - 1) === '\r') endIndex--;
        if (fileData.charAt(endIndex - 1) === '\n' || fileData.charAt(endIndex - 1) === '\r') endIndex--;

        // Get the template
        const template = fileData.substring(startIndex, endIndex);

        // Create the SQL template
        const sqlTemplate = new SqlTemplate(template, sqlConfig);

        // If cache being used
        if (cache === true) {
            // Add the SQL template to the cache
            SqlTemplateFile._templateCache.set(cacheKey, sqlTemplate);
        }

        // Return a promise with the resolved SQL template
        return Promise.resolve(sqlTemplate);
    }

    /**
     * Get a SQL template from a file (or cache).
     * @param {String} file Either the full path to the file or (if importMetaUrl is used) the relative path to the file.
     * @param {String} [importMetaUrl] The location of the module that is calling the function. This is used when working with relative paths.
     * @param {SqlConfig} [sqlConfig] The SQL config settings to use.
     * @param {Boolean} [cache=true] Is the SQL template cached so that it does not need to be read from the file next time.
     * @return {Promise} A promise that resolves the SQL template.
     */
    static async getTemplate(file, importMetaUrl, sqlConfig, cache) {
        // Check cache default value
        if (cache === undefined) cache = true;

        // Set full path
        let fullPath = file;

        // If using relative path
        if (importMetaUrl) {
            // Get calling file path
            const callingFile = fileURLToPath(importMetaUrl);

            // Get calling folder location
            const callingFolder = Path.dirname(callingFile);

            // Set the relative full path
            fullPath = Path.join(callingFolder, file);
        }

        // If cache being used
        if (cache === true) {
            // If the template is in the cache
            if (SqlTemplateFile._templateCache.has(fullPath) === true) {
                // Get the cached SQL template
                const sqlTemplate = SqlTemplateFile._templateCache.get(fullPath);

                // Return a promise that resolves the SQL template
                return Promise.resolve(sqlTemplate);
            }
        }

        // Get template file data
        const template = await readFile(fullPath, { encoding: 'utf8' });

        // Create the SQL template
        const sqlTemplate = new SqlTemplate(template, sqlConfig);

        // If cache being used
        if (cache === true) {
            // Add the SQL template to the cache
            SqlTemplateFile._templateCache.set(fullPath, sqlTemplate);
        }

        // Return a promise with the resolved SQL template
        return Promise.resolve(sqlTemplate);
    }
}