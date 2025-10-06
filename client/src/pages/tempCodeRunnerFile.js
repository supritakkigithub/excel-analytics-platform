axios.get(`/api/uploads/content/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });