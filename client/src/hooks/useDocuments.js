import { useState, useEffect, useCallback } from 'react';
import documentService from '../services/documentService';

export function useDocuments(initialCategory = 'all') {
  const [documents, setDocuments] = useState([]);
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await documentService.getDocuments({
        category: category !== 'all' ? category : undefined,
        search: search.trim() || undefined,
      });
      setDocuments(data);
    } catch (err) {
      setError(err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadDocument = async (formData) => {
    const newDoc = await documentService.uploadDocument(formData);
    setDocuments((prev) => [newDoc, ...prev]);
    return newDoc;
  };

  const reprocessOCR = async (id) => {
    const updated = await documentService.reprocessOCR(id);
    setDocuments((prev) => prev.map((d) => (d._id === id ? updated : d)));
    return updated;
  };

  const deleteDocument = async (id) => {
    await documentService.deleteDocument(id);
    setDocuments((prev) => prev.filter((d) => d._id !== id));
  };

  return {
    documents,
    category,
    setCategory,
    search,
    setSearch,
    loading,
    error,
    refresh: fetchDocuments,
    uploadDocument,
    reprocessOCR,
    deleteDocument,
  };
}

export default useDocuments;
