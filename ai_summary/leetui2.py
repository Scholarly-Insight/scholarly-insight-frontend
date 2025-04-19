import streamlit as st
import google.generativeai as genai
import arxiv
import time

# === Gemini API Key ===
genai.configure(api_key="AIzaSyCg9wgyjYklLr2x0V8HHmhG1tynnnL9K7Q")

# === Function to search arXiv ===
def search_arxiv(query, max_results=5):
    search = arxiv.Search(
        query=query,
        max_results=max_results,
        sort_by=arxiv.SortCriterion.Relevance
    )
    return list(search.results())

# === Function to get article details ===
def get_article_details(article_id):
    search = arxiv.Search(id_list=[article_id])
    article = next(search.results())
    return article

# === Function to summarize text using Gemini ===
def summarize_text(text):
    if not text:
        return "No text available for summarization."
    
    model = genai.GenerativeModel(model_name="gemini-1.5-flash")
    response = model.generate_content(f"Please provide a comprehensive summary of this research paper:\n\n{text}")
    return response.text

# === Function to extract key points using Gemini ===
def extract_key_points(text):
    if not text:
        return "No text available for key points extraction."
    
    model = genai.GenerativeModel(model_name="gemini-1.5-flash")
    response = model.generate_content(
        f"Please extract the key points, contributions, and main findings from this research paper:\n\n{text}"
    )
    return response.text

# === Streamlit UI ===
st.set_page_config(page_title="Scholarly Insight", layout="centered")
st.title("📚 Scholarly Insight - Research Paper Summarizer")

# Search interface
search_query = st.text_input("🔍 Search for research papers", 
                           placeholder="Enter keywords, paper title, or author name")

if search_query:
    with st.spinner("Searching arXiv..."):
        results = search_arxiv(search_query)
    
    if results:
        st.success(f"Found {len(results)} papers")
        
        # Display search results
        for i, paper in enumerate(results):
            with st.expander(f"{i+1}. {paper.title}"):
                st.write(f"**Authors:** {', '.join(author.name for author in paper.authors)}")
                st.write(f"**Published:** {paper.published}")
                st.write(f"**Abstract:** {paper.summary[:300]}...")
                
                if st.button("Summarize", key=f"summarize_{i}"):
                    with st.spinner("Fetching article details..."):
                        article = get_article_details(paper.entry_id.split('/')[-1])
                    
                    with st.spinner("Generating summary..."):
                        summary = summarize_text(article.summary)
                        st.subheader("📌 Summary")
                        st.write(summary)
                        
                        key_points = extract_key_points(article.summary)
                        st.subheader("🧠 Key Points")
                        st.write(key_points)
                        
                        st.markdown(f"[📄 Download PDF]({article.pdf_url})")
    else:
        st.warning("No papers found. Try different search terms.")
