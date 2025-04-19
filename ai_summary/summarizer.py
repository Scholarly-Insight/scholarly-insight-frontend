import streamlit as st
import google.generativeai as genai
import arxiv

# === Gemini API Key ===
genai.configure(api_key="AIzaSyCg9wgyjYklLr2x0V8HHmhG1tynnnL9K7Q")

# === Function to get article details ===
def get_article_details(title, authors):
    # Create a search query combining title and authors
    query = f'ti:"{title}" AND au:"{authors}"'
    search = arxiv.Search(
        query=query,
        max_results=1,
        sort_by=arxiv.SortCriterion.Relevance
    )
    try:
        article = next(search.results())
        return article
    except StopIteration:
        return None

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
st.set_page_config(page_title="Paper Summarizer", layout="centered")
st.title("📚 Research Paper Summarizer")

# Input fields
paper_title = st.text_input("📝 Paper Title", 
                          placeholder="Enter the exact title of the paper")
paper_authors = st.text_input("👥 Authors", 
                            placeholder="Enter the authors' names")

if st.button("Generate Summary"):
    if not paper_title or not paper_authors:
        st.warning("Please enter both the paper title and authors.")
    else:
        with st.spinner("🔍 Finding paper..."):
            article = get_article_details(paper_title, paper_authors)
            
            if article:
                st.success("✅ Paper found!")
                
                # Display paper details
                st.subheader("📄 Paper Details")
                st.write(f"**Title:** {article.title}")
                st.write(f"**Authors:** {', '.join(author.name for author in article.authors)}")
                st.write(f"**Published:** {article.published}")
                
                with st.spinner("✏️ Generating summary..."):
                    summary = summarize_text(article.summary)
                    st.subheader("📌 Summary")
                    st.write(summary)
                    
                    key_points = extract_key_points(article.summary)
                    st.subheader("🧠 Key Points")
                    st.write(key_points)
                    
                    st.markdown(f"[📄 Download PDF]({article.pdf_url})")
            else:
                st.error("❌ Paper not found. Please check the title and authors and try again.") 