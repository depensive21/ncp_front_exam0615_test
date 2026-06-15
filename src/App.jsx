import React, { useEffect, useRef, useState } from "react";
import "./App.css";

const API_BASE_URL = "/api";

function App() {
  const [diaries, setDiaries] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [selected, setSelected] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    diaryDate: "",
    content: "",
    file: null,
  });

  const [editForm, setEditForm] = useState({
    title: "",
    diaryDate: "",
    content: "",
    file: null,
  });

  const loaderRef = useRef(null);

  async function loadDiaries(nextPage = 0) {
    if (loading || (!hasMore && nextPage !== 0)) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch(
        `${API_BASE_URL}/diaries?page=${nextPage}&size=10`,
      );

      if (!res.ok) {
        throw new Error("다이어리 목록 조회 실패");
      }

      const data = await res.json();

      if (nextPage === 0) {
        setDiaries(data.items);
      } else {
        setDiaries((prev) => [...prev, ...data.items]);
      }

      setHasMore(data.hasMore);
      setPage(nextPage);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "다이어리 목록을 불러오지 못했습니다. 백엔드 서버 또는 DB 연결을 확인하세요.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadDetail(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/diaries/${id}`);
      const data = await response.json();

      setSelected(data);
      setEditForm({
        title: data.title,
        diaryDate: data.diary_date,
        content: data.content,
        file: null,
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error("다이어리 상세 조회 실패:", error);
      alert("다이어리 상세 내용을 불러오지 못했습니다.");
    }
  }

  function closeModal() {
    setIsModalOpen(false);
    setSelected(null);
    setEditForm({
      title: "",
      diaryDate: "",
      content: "",
      file: null,
    });
  }

  async function createDiary(event) {
    event.preventDefault();

    const body = new FormData();
    body.append("title", form.title);
    body.append("diaryDate", form.diaryDate);
    body.append("content", form.content);

    if (form.file) {
      body.append("file", form.file);
    }

    try {
      await fetch(`${API_BASE_URL}/diaries`, {
        method: "POST",
        body,
      });

      setForm({
        title: "",
        diaryDate: "",
        content: "",
        file: null,
      });

      await loadDiaries(0);
    } catch (error) {
      console.error("다이어리 작성 실패:", error);
      alert("다이어리 작성에 실패했습니다.");
    }
  }

  async function updateDiary(event) {
    event.preventDefault();

    if (!selected) return;

    const body = new FormData();
    body.append("title", editForm.title);
    body.append("diaryDate", editForm.diaryDate);
    body.append("content", editForm.content);

    if (editForm.file) {
      body.append("file", editForm.file);
    }

    try {
      await fetch(`${API_BASE_URL}/diaries/${selected.id}`, {
        method: "PUT",
        body,
      });

      await loadDetail(selected.id);
      await loadDiaries(0);
      alert("수정되었습니다.");
    } catch (error) {
      console.error("다이어리 수정 실패:", error);
      alert("다이어리 수정에 실패했습니다.");
    }
  }

  async function deleteDiary(id) {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      await fetch(`${API_BASE_URL}/diaries/${id}`, {
        method: "DELETE",
      });

      closeModal();
      await loadDiaries(0);
    } catch (error) {
      console.error("다이어리 삭제 실패:", error);
      alert("다이어리 삭제에 실패했습니다.");
    }
  }

  useEffect(() => {
    loadDiaries(0);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadDiaries(page + 1);
      }
    });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [page, hasMore, loading]);

  return (
    <div className="container py-4">
      <header className="mb-4">
        <h1 className="fw-bold">나만의 다이어리</h1>
        <p className="text-muted mb-0">
          React + Node.js + MySQL + Nginx 직접 배포 예제
        </p>
      </header>

      <div className="row g-4">
        <section className="col-lg-5">
          <div className="card shadow-sm">
            <div className="card-header fw-bold">다이어리 작성</div>

            <div className="card-body">
              <form onSubmit={createDiary}>
                <input
                  className="form-control mb-2"
                  placeholder="제목"
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  required
                />

                <input
                  className="form-control mb-2"
                  type="date"
                  value={form.diaryDate}
                  onChange={(event) =>
                    setForm({ ...form, diaryDate: event.target.value })
                  }
                  required
                />

                <textarea
                  className="form-control mb-2"
                  rows="6"
                  placeholder="내용"
                  value={form.content}
                  onChange={(event) =>
                    setForm({ ...form, content: event.target.value })
                  }
                  required
                />

                <input
                  className="form-control mb-3"
                  type="file"
                  onChange={(event) =>
                    setForm({ ...form, file: event.target.files[0] })
                  }
                />

                <button className="btn btn-primary w-100" type="submit">
                  저장
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="col-lg-7">
          <h2 className="h5 fw-bold mb-3">다이어리 목록</h2>

          <div className="row g-3">
            {diaries.map((diary) => (
              <div className="col-md-6" key={diary.id}>
                <div
                  className="card diary-card h-100"
                  onClick={() => loadDetail(diary.id)}
                >
                  <div className="card-body">
                    <div className="text-muted small mb-2">
                      #{diary.id} · {diary.diary_date}
                    </div>

                    <h3 className="h5 card-title">{diary.title}</h3>

                    <p className="text-muted small mb-0">
                      클릭하면 모달창으로 상세 내용을 확인할 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div ref={loaderRef} className="text-center text-muted py-4">
            {loading
              ? "불러오는 중..."
              : hasMore
                ? "스크롤하면 더 불러옵니다."
                : "마지막 글입니다."}
          </div>
        </section>
      </div>

      {isModalOpen && selected && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div
              className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
              role="document"
            >
              <div className="modal-content">
                <div className="modal-header">
                  <div>
                    <h5 className="modal-title fw-bold">
                      다이어리 상세 / 수정
                    </h5>
                    <div className="text-muted small">#{selected.id}</div>
                  </div>

                  <button
                    type="button"
                    className="btn-close"
                    aria-label="닫기"
                    onClick={closeModal}
                  />
                </div>

                <form onSubmit={updateDiary}>
                  <div className="modal-body">
                    <input
                      className="form-control mb-2"
                      value={editForm.title}
                      onChange={(event) =>
                        setEditForm({ ...editForm, title: event.target.value })
                      }
                      required
                    />

                    <input
                      className="form-control mb-2"
                      type="date"
                      value={editForm.diaryDate}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          diaryDate: event.target.value,
                        })
                      }
                      required
                    />

                    <textarea
                      className="form-control mb-2"
                      rows="8"
                      value={editForm.content}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          content: event.target.value,
                        })
                      }
                      required
                    />

                    <input
                      className="form-control mb-3"
                      type="file"
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          file: event.target.files[0],
                        })
                      }
                    />

                    {selected.original_file_name && (
                      <a
                        className="btn btn-outline-secondary w-100"
                        href={`${API_BASE_URL}/diaries/${selected.id}/download`}
                      >
                        파일 다운로드: {selected.original_file_name}
                      </a>
                    )}
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-outline-danger me-auto"
                      onClick={() => deleteDiary(selected.id)}
                    >
                      삭제
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={closeModal}
                    >
                      닫기
                    </button>

                    <button type="submit" className="btn btn-success">
                      수정
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="modal-backdrop fade show" />
        </>
      )}
    </div>
  );
}

export default App;
